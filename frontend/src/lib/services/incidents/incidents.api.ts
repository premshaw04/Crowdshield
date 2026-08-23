import { apiConfig } from '../../api/config';
import { apiClient } from '../../api/client';
import { IIncidentsService, Incident } from './incidents.types';

const mapIncidentResponse = (data: any): Incident => {
  return {
    ...data,
    eventId: data.event_id || data.eventId || 'unknown',
    title: data.title || (data.type ? `Incident: ${data.type}` : 'Unknown Incident'),
    description: data.description || '',
    severity: data.severity || 'MEDIUM', // default mock severity
    location: data.location || (data.zone_id ? `Zone: ${data.zone_id}` : 'Unknown Location'),
    status: data.status || 'OPEN',
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt || data.created_at || new Date().toISOString(),
  };
};

export class IncidentsApi implements IIncidentsService {
  async getIncidents(): Promise<Incident[]> {
    const isDemo = apiConfig.IS_DEMO_MODE;
    const data = await apiClient.get<any[]>(`/incidents?is_demo=${isDemo}`);
    return data.map(mapIncidentResponse);
  }

  async getEventIncidents(eventId: string): Promise<Incident[]> {
    const data = await apiClient.get<any[]>(`/events/${eventId}/incidents`);
    return data.map(mapIncidentResponse);
  }

  async getIncidentById(incidentId: string): Promise<Incident> {
    const data = await apiClient.get<any>(`/incidents/${incidentId}`);
    return mapIncidentResponse(data);
  }

  async createIncident(payload: Partial<Incident> & { eventId: string }): Promise<Incident> {
    const data = await apiClient.post<any>('/incidents', payload);
    return mapIncidentResponse(data);
  }

  async updateIncident(incidentId: string, payload: Partial<Incident>): Promise<Incident> {
    const data = await apiClient.patch<any>(`/incidents/${incidentId}`, payload);
    return mapIncidentResponse(data);
  }

  async acknowledgeIncident(incidentId: string): Promise<Incident> {
    const data = await apiClient.post<any>(`/incidents/${incidentId}/acknowledge`);
    return mapIncidentResponse(data);
  }

  async resolveIncident(incidentId: string): Promise<Incident> {
    const data = await apiClient.post<any>(`/incidents/${incidentId}/resolve`);
    return mapIncidentResponse(data);
  }
}
