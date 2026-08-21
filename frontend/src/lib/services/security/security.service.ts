import { apiConfig } from '../../api/config';
import { SecurityApi } from './security.api';
import { SecurityDemo } from './security.demo';
import { ISecurityService } from './security.types';

export const securityService: ISecurityService = apiConfig.IS_DEMO_MODE 
  ? new SecurityDemo() 
  : new SecurityApi();

export type { ISecurityService };
