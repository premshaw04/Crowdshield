import { apiClient } from '../../api/client';
import { IAlertsService, Alert } from './alerts.types';

export class AlertsApi implements IAlertsService {
  async getAlerts(): Promise<Alert[]> {
    return apiClient.get<Alert[]>('/alerts');
  }

  async getEventAlerts(eventId: string): Promise<Alert[]> {
    return apiClient.get<Alert[]>(`/events/${eventId}/alerts`);
  }

  async getAlertById(alertId: string): Promise<Alert> {
    return apiClient.get<Alert>(`/alerts/${alertId}`);
  }

  async acknowledgeAlert(alertId: string): Promise<Alert> {
    return apiClient.post<Alert>(`/alerts/${alertId}/acknowledge`);
  }

  async resolveAlert(alertId: string): Promise<Alert> {
    return apiClient.post<Alert>(`/alerts/${alertId}/resolve`);
  }
}
