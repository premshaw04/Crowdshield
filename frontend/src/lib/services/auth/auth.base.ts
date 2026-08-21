import { apiClient } from '../../api/client';
import { IAuthService, User } from './auth.types';

export abstract class AuthBase implements IAuthService {
  protected user: User | null = null;
  protected accessToken: string | null = null;

  constructor() {
    // Load from memory/storage on init if in browser
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('current_user');
      if (storedToken) {
        this.accessToken = storedToken;
      }
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser);
        } catch (e) {
          console.error('Failed to parse stored user', e);
        }
      }
      
      // Listen for unrecoverable auth events (fired when refresh fails or 401 is persistent)
      window.addEventListener('auth:unauthorized', () => {
        this.clearSession();
        // UI router should intercept this to force a login redirect
      });

      // Register token refresh interceptor with API client
      apiClient.onUnauthorized(this.refresh.bind(this));
    }
  }

  get isAuthenticated(): boolean {
    return !!this.accessToken || !!this.user;
  }

  get currentUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  protected setSession(token: string, user: User) {
    this.accessToken = token;
    this.user = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
      localStorage.setItem('current_user', JSON.stringify(user));
    }
  }

  protected clearSession() {
    this.accessToken = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract login(credentials: any): Promise<any>;
  abstract logout(): Promise<void>;
  abstract refresh(): Promise<void>;
  abstract getCurrentUser(): Promise<User>;
}
