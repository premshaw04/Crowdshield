import { apiConfig } from '../../api/config';
import { IAuthService } from './auth.types';
import { AuthApi } from './auth.api';

export const authService: IAuthService = new AuthApi();
