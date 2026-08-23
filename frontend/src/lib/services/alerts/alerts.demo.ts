import { auditLogService } from '..';
import { IAlertsService, Alert } from './alerts.types';

const alertsDb: Record<string, Alert[]> = {};

export class AlertsDemo implements IAlertsService {
  async getAlerts(): Promise<Alert[]> {
    return Object.values(alertsDb).flat();
  }

  async getEventAlerts(eventId: string): Promise<Alert[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!alertsDb[eventId]) {
      alertsDb[eventId] = [
        {
          id: 'alert_1',
          eventId,
          severity: 'CRITICAL',
          location: 'Food Court (Zone B)',
          message: 'Crowd crush risk detected',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          status: 'ACTIVE'
        },
        {
          id: 'alert_2',
          eventId,
          severity: 'HIGH',
          location: 'Gate 2',
          message: 'Abnormal crowd movement',
          timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          status: 'ACTIVE'
        },
        {
          id: 'alert_3',
          eventId,
          severity: 'MEDIUM',
          location: 'West Wing',
          message: 'Density steadily increasing',
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          status: 'ACKNOWLEDGED'
        }
      ];
    }
    
    return alertsDb[eventId];
  }

  async getAlertById(alertId: string): Promise<Alert> {
    for (const eventId in alertsDb) {
      const alert = alertsDb[eventId].find(a => a.id === alertId);
      if (alert) return alert;
    }
    throw new Error('Alert not found');
  }

  async acknowledgeAlert(alertId: string): Promise<Alert> {
    for (const eventId in alertsDb) {
      const idx = alertsDb[eventId].findIndex(a => a.id === alertId);
      if (idx !== -1) {
        alertsDb[eventId][idx].status = 'ACKNOWLEDGED';
        
        auditLogService.logAction({
          eventId,
          actor: 'System Admin',
          role: 'Authority',
          action: `Acknowledged Alert: ${alertsDb[eventId][idx].message}`,
          target: alertsDb[eventId][idx].location,
          result: 'SUCCESS'
        });
        
        return alertsDb[eventId][idx];
      }
    }
    throw new Error('Alert not found');
  }

  async resolveAlert(alertId: string): Promise<Alert> {
    for (const eventId in alertsDb) {
      const idx = alertsDb[eventId].findIndex(a => a.id === alertId);
      if (idx !== -1) {
        alertsDb[eventId][idx].status = 'RESOLVED';
        
        auditLogService.logAction({
          eventId,
          actor: 'System Admin',
          role: 'Authority',
          action: `Resolved Alert: ${alertsDb[eventId][idx].message}`,
          target: alertsDb[eventId][idx].location,
          result: 'SUCCESS'
        });
        
        return alertsDb[eventId][idx];
      }
    }
    throw new Error('Alert not found');
  }
}
