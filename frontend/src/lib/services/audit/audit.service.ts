import { apiConfig } from '../../api/config';
import { IAuditLogService } from './audit.types';
import { AuditLogApi } from './audit.api';

export const auditLogService: IAuditLogService  = new AuditLogApi();
