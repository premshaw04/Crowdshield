import { apiConfig } from '../../api/config';
import { AlertsApi } from './alerts.api';
import { AlertsDemo } from './alerts.demo';
import { IAlertsService } from './alerts.types';

export const alertsService: IAlertsService = apiConfig.IS_DEMO_MODE 
  ? new AlertsDemo() 
  : new AlertsApi();

export type { IAlertsService };
