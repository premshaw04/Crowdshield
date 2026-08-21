import { apiConfig } from '../../api/config';
import { IAuthService } from './auth.types';
import { AuthApi } from './auth.api';
import { AuthDemo } from './auth.demo';

export const authService: IAuthService = apiConfig.IS_DEMO_MODE 
  ? new AuthDemo() 
  : new AuthApi();
