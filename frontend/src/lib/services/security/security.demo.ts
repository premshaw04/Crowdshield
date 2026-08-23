import { auditLogService } from '..';
import { ISecurityService, SecurityDeployment } from './security.types';

const globalDeploymentsDb: SecurityDeployment[] = [
  { id: 'sec_1', zone: 'Food Court', staffCount: 28, status: 'ACTIVE' },
  { id: 'sec_2', zone: 'Main Entrance', staffCount: 34, status: 'ACTIVE' },
  { id: 'sec_3', zone: 'West Wing', staffCount: 20, status: 'ACTIVE' },
  { id: 'sec_4', zone: 'Parking Area', staffCount: 15, status: 'ACTIVE' },
  { id: 'sec_5', zone: 'Gate 3', staffCount: 12, status: 'ACTIVE' },
];

export class SecurityDemo implements ISecurityService {
  async getDeployments(): Promise<SecurityDeployment[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return globalDeploymentsDb;
  }

  async getEventSecurity(eventId: string): Promise<SecurityDeployment[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return globalDeploymentsDb.map(d => ({ ...d, eventId }));
  }

  async deploySecurity(payload: { eventId?: string; zone: string; staffCount: number }): Promise<SecurityDeployment> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const newDeployment: SecurityDeployment = {
      id: `sec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      eventId: payload.eventId,
      zone: payload.zone,
      staffCount: payload.staffCount,
      status: 'ACTIVE'
    };
    
    globalDeploymentsDb.unshift(newDeployment);
    
    auditLogService.logAction({
      eventId: payload.eventId || 'GLOBAL',
      actor: 'System Admin',
      role: 'Authority',
      action: `Deployed ${payload.staffCount} units to ${payload.zone}`,
      target: payload.zone,
      result: 'SUCCESS'
    });
    
    return newDeployment;
  }

  async cancelDeployment(deploymentId: string): Promise<SecurityDeployment> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const idx = globalDeploymentsDb.findIndex(d => d.id === deploymentId);
    if (idx === -1) throw new Error('Deployment not found');
    
    globalDeploymentsDb[idx].status = 'CANCELLED';
    
    auditLogService.logAction({
      eventId: globalDeploymentsDb[idx].eventId || 'GLOBAL',
      actor: 'System Admin',
      role: 'Authority',
      action: `Cancelled deployment at ${globalDeploymentsDb[idx].zone}`,
      target: globalDeploymentsDb[idx].zone,
      result: 'SUCCESS'
    });
    
    return globalDeploymentsDb[idx];
  }
}
