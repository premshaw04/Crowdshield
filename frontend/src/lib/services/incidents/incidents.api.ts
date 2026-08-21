import { apiClient } from '../../api/client';
import { IIncidentsService, Incident } from './incidents.types';

export class IncidentsApi implements IIncidentsService {
  async getIncidents(): Promise<Incident[]> {
    return apiClient.get<Incident[]>('/incidents');
  }

  async getEventIncidents(eventId: string): Promise<Incident[]> {
    return apiClient.get<Incident[]>(`/events/${eventId}/incidents`);
  }

  async getIncidentById(incidentId: string): Promise<Incident> {
    return apiClient.get<Incident>(`/incidents/${incidentId}`);
  }

  async createIncident(payload: Partial<Incident> & { eventId: string }): Promise<Incident> {
    return apiClient.post<Incident>('/incidents', payload);
  }

  async updateIncident(incidentId: string, payload: Partial<Incident>): Promise<Incident> {
    return apiClient.patch<Incident>(`/incidents/${incidentId}`, payload);
  }

  async acknowledgeIncident(incidentId: string): Promise<Incident> {
    return apiClient.post<Incident>(`/incidents/${incidentId}/acknowledge`);
  }

  async resolveIncident(incidentId: string): Promise<Incident> {
    return apiClient.post<Incident>(`/incidents/${incidentId}/resolve`);
  }
}
