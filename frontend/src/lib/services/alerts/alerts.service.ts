import { AlertsApi } from './alerts.api';
import { IAlertsService } from './alerts.types';

export const alertsService: IAlertsService = new AlertsApi();

export type { IAlertsService };
