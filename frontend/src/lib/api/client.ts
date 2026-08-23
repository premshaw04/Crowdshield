import { apiConfig } from './config';
import { APIError, handleApiError, normalizeError } from './errors';

export type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean>;
  skipAuthRefresh?: boolean; // Prevents infinite loops on the refresh endpoint itself
};

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshQueue: Array<() => void> = [];
  private onUnauthorizedCallback?: () => Promise<void>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Register a callback to handle 401 Unauthorized errors (e.g. attempt to refresh token).
   * The callback should throw if it cannot recover the session.
   */
  onUnauthorized(fn: () => Promise<void>) {
    this.onUnauthorizedCallback = fn;
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, headers, skipAuthRefresh, ...restOptions } = options;

    let url = `${this.baseURL}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const defaultHeaders: Record<string, string> = {
      'Accept': 'application/json',
    };

    // Only set application/json if body is not FormData
    if (!(restOptions.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    // Extract auth token via a secure isolated getter or localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.TIMEOUT);

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        credentials: 'include', // Support HttpOnly cookies
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized with Token Refresh (only if callback provided and not skipping)
      if (response.status === 401 && !skipAuthRefresh && this.onUnauthorizedCallback) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            await this.onUnauthorizedCallback();
            this.isRefreshing = false;
            // Notify all waiting requests to proceed
            this.refreshQueue.forEach(resolve => resolve());
            this.refreshQueue = [];
            
            // Retry the original request
            return await this.request<T>(endpoint, { ...options, skipAuthRefresh: true });
          } catch (_) {
            this.isRefreshing = false;
            this.refreshQueue.forEach(resolve => resolve()); // Let queued requests fail cleanly
            this.refreshQueue = [];
            // Let the original 401 fall through to normal error handling
          }
        } else {
          // Wait for the ongoing refresh to finish, then retry
          await new Promise<void>(resolve => {
            this.refreshQueue.push(() => resolve());
          });
          return await this.request<T>(endpoint, { ...options, skipAuthRefresh: true });
        }
      }

      let data: unknown = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const requestId = response.headers.get('x-request-id') || undefined;
        throw normalizeError(response.status, data, requestId);
      }

      return data as T;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return handleApiError(new APIError('Request timeout', 408));
      }
      return handleApiError(error);
    }
  }

  get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? (data instanceof URLSearchParams ? data.toString() : JSON.stringify(data)) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  upload<T>(endpoint: string, data: FormData, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data, // Do not stringify
    });
  }
}

export const apiClient = new ApiClient(apiConfig.API_BASE_URL);
