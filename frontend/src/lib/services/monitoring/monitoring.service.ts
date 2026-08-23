import { apiConfig } from '../../api/config';
import { MonitoringApi } from './monitoring.api';
import { IMonitoringService } from './monitoring.types';

export const monitoringService: IMonitoringService  = new MonitoringApi();

export type { IMonitoringService };
