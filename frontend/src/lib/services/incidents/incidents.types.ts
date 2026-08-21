export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export interface Incident {
  id: string;
  eventId: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  location: string;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IIncidentsService {
  getIncidents(): Promise<Incident[]>;
  getEventIncidents(eventId: string): Promise<Incident[]>;
  getIncidentById(incidentId: string): Promise<Incident>;
  createIncident(payload: Partial<Incident> & { eventId: string }): Promise<Incident>;
  updateIncident(incidentId: string, payload: Partial<Incident>): Promise<Incident>;
  acknowledgeIncident(incidentId: string): Promise<Incident>;
  resolveIncident(incidentId: string): Promise<Incident>;
}
