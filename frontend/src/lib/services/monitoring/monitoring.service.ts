import { apiConfig } from '../../api/config';
import { MonitoringApi } from './monitoring.api';
import { MonitoringDemo } from './monitoring.demo';
import { IMonitoringService } from './monitoring.types';

export const monitoringService: IMonitoringService = apiConfig.IS_DEMO_MODE 
  ? new MonitoringDemo() 
  : new MonitoringApi();

export type { IMonitoringService };
