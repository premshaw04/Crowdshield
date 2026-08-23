export type Role = 'SUPER_ADMIN' | 'AUTHORITY' | 'SECURITY_SUPERVISOR' | 'OPERATOR' | 'CITIZEN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: User;
}

export interface AuthCredentials {
  email?: string;
  password?: string;
  [key: string]: unknown; // Support other methods if needed
}

export interface IAuthService {
  readonly isAuthenticated: boolean;
  readonly currentUser: User | null;
  getToken(): string | null;
  login(credentials: AuthCredentials): Promise<LoginResponse>;
  register(data: any): Promise<any>;
  logout(): Promise<void>;
  refresh(): Promise<void>;
  getCurrentUser(): Promise<User>;
}
