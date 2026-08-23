import { AuthBase } from './auth.base';
import { AuthCredentials, LoginResponse, User } from './auth.types';

export class AuthDemo extends AuthBase {
  async login(credentials: AuthCredentials): Promise<LoginResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockUser: User = {
      id: 'usr_mock_123',
      name: 'Demo Admin',
      email: credentials.email || 'admin@crowdshield.local',
      role: 'AUTHORITY',
      permissions: ['manage:events', 'view:telemetry', 'manage:gates', 'approve:recommendations']
    };
    const mockToken = 'mock_jwt_token_12345';
    this.setSession(mockToken, mockUser);
    
    return {
      access_token: mockToken,
      token_type: 'bearer',
      user: mockUser
    };
  }

  async logout(): Promise<void> {
    this.clearSession();
  }

  async refresh(): Promise<void> {
    // No op in demo mode
    return;
  }

  async getCurrentUser(): Promise<User> {
    if (this.user) return this.user;
    throw new Error('Not authenticated in demo mode');
  }
}
