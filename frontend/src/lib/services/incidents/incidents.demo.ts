import { auditLogService } from '..';
import { IIncidentsService, Incident } from './incidents.types';

const incidentsDb: Record<string, Incident[]> = {};

export class IncidentsDemo implements IIncidentsService {
  async getIncidents(): Promise<Incident[]> {
    return Object.values(incidentsDb).flat();
  }

  async getEventIncidents(eventId: string): Promise<Incident[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (!incidentsDb[eventId]) {
      incidentsDb[eventId] = [
        {
          id: 'inc_101',
          eventId,
          title: 'Medical Emergency',
          description: 'Attendee collapsed near Gate 4. Medical team dispatched.',
          severity: 'HIGH',
          location: 'Gate 4',
          status: 'INVESTIGATING',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
        },
        {
          id: 'inc_102',
          eventId,
          title: 'Unauthorized Access',
          description: 'Individual bypassed security screening at VIP Entrance.',
          severity: 'CRITICAL',
          location: 'VIP Entrance',
          status: 'OPEN',
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        }
      ];
    }
    
    return incidentsDb[eventId];
  }

  async getIncidentById(incidentId: string): Promise<Incident> {
    for (const eventId in incidentsDb) {
      const inc = incidentsDb[eventId].find(i => i.id === incidentId);
      if (inc) return inc;
    }
    throw new Error('Incident not found');
  }

  async createIncident(payload: Partial<Incident> & { eventId: string }): Promise<Incident> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newIncident: Incident = {
      id: `inc_${Math.floor(Math.random() * 10000)}`,
      eventId: payload.eventId,
      title: payload.title || 'New Incident',
      description: payload.description || '',
      severity: payload.severity || 'MEDIUM',
      location: payload.location || 'Unknown',
      status: payload.status || 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!incidentsDb[payload.eventId]) {
      incidentsDb[payload.eventId] = [];
    }
    incidentsDb[payload.eventId].unshift(newIncident);
    
    auditLogService.logAction({
      eventId: payload.eventId,
      actor: 'System Admin',
      role: 'Authority',
      action: `Created Incident: ${newIncident.title}`,
      target: newIncident.location,
      result: 'SUCCESS'
    });
    
    return newIncident;
  }

  async updateIncident(incidentId: string, payload: Partial<Incident>): Promise<Incident> {
    for (const eventId in incidentsDb) {
      const idx = incidentsDb[eventId].findIndex(i => i.id === incidentId);
      if (idx !== -1) {
        incidentsDb[eventId][idx] = { ...incidentsDb[eventId][idx], ...payload, updatedAt: new Date().toISOString() };
        return incidentsDb[eventId][idx];
      }
    }
    throw new Error('Incident not found');
  }

  async acknowledgeIncident(incidentId: string): Promise<Incident> {
    return this.updateIncident(incidentId, { status: 'INVESTIGATING' });
  }

  async resolveIncident(incidentId: string): Promise<Incident> {
    const resolved = await this.updateIncident(incidentId, { status: 'RESOLVED' });
    
    auditLogService.logAction({
      eventId: resolved.eventId,
      actor: 'System Admin',
      role: 'Authority',
      action: `Resolved Incident: ${resolved.title}`,
      target: resolved.location,
      result: 'SUCCESS'
    });
    
    return resolved;
  }
}
