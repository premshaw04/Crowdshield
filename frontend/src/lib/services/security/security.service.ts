import { apiConfig } from '../../api/config';
import { SecurityApi } from './security.api';
import { ISecurityService } from './security.types';

export const securityService: ISecurityService  = new SecurityApi();

export type { ISecurityService };
