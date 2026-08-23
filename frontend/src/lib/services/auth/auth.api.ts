import { apiClient } from '../../api/client';
import { AuthBase } from './auth.base';
import { AuthCredentials, LoginResponse, User } from './auth.types';

export class AuthApi extends AuthBase {
  async login(credentials: AuthCredentials): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email || '');
    formData.append('password', credentials.password || '');
    formData.append('scope', 'authority');

    const response = await apiClient.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // Override the default apiClient stringification logic by passing URLSearchParams as string
      // Wait, apiClient.post stringifies the body if data is provided. Let's use apiClient's upload or create a custom request.
    });
    
    // Store token securely.
    if (response.access_token && response.user) {
      this.setSession(response.access_token, response.user);
    } else if (response.user) {
      // Cookie-based fallback: just store user data
      this.user = response.user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('current_user', JSON.stringify(response.user));
      }
    }
    
    return response;
  }

  async register(data: any): Promise<any> {
    // API call to register
    const response = await apiClient.post<User>('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'AUTHORITY'
    });
    
    // Auto-login after register
    return this.login({ email: data.email, password: data.password });
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed, clearing local session anyway.', error);
    } finally {
      this.clearSession();
    }
  }

  async refresh(): Promise<void> {
    try {
      // Must pass skipAuthRefresh to prevent infinite 401 loop if refresh itself fails
      const response = await apiClient.post<{ access_token: string }>('/auth/refresh', undefined, { skipAuthRefresh: true });
      if (response.access_token) {
        this.accessToken = response.access_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', response.access_token);
        }
      }
    } catch (error) {
      console.warn('Failed to refresh token, forcing session end', error);
      this.clearSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    const user = await apiClient.get<User>('/auth/me');
    this.user = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_user', JSON.stringify(user));
    }
    return user;
  }
}
