import { apiConfig } from '../../api/config';
import { IAuditLogService } from './audit.types';
import { AuditLogApi } from './audit.api';
import { AuditLogDemo } from './audit.demo';

export const auditLogService: IAuditLogService = apiConfig.IS_DEMO_MODE 
  ? new AuditLogDemo() 
  : new AuditLogApi();
