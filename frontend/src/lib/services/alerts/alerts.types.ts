export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: string;
  eventId: string;
  severity: AlertSeverity;
  location: string;
  message: string;
  timestamp: string;
  status: AlertStatus;
}

export interface IAlertsService {
  getAlerts(): Promise<Alert[]>;
  getEventAlerts(eventId: string): Promise<Alert[]>;
  getAlertById(alertId: string): Promise<Alert>;
  acknowledgeAlert(alertId: string): Promise<Alert>;
  resolveAlert(alertId: string): Promise<Alert>;
}
