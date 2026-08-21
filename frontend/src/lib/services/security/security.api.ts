import { apiClient } from '../../api/client';
import { ISecurityService, SecurityDeployment } from './security.types';

export class SecurityApi implements ISecurityService {
  async getDeployments(): Promise<SecurityDeployment[]> {
    return apiClient.get<SecurityDeployment[]>('/security/units');
  }

  async getEventSecurity(eventId: string): Promise<SecurityDeployment[]> {
    return apiClient.get<SecurityDeployment[]>(`/events/${eventId}/security`);
  }

  async deploySecurity(payload: { eventId?: string; zone: string; staffCount: number }): Promise<SecurityDeployment> {
    const endpoint = payload.eventId ? `/events/${payload.eventId}/security/deploy` : `/security/deploy`;
    return apiClient.post<SecurityDeployment>(endpoint, payload);
  }

  async cancelDeployment(deploymentId: string): Promise<SecurityDeployment> {
    return apiClient.post<SecurityDeployment>(`/security/deployments/${deploymentId}/cancel`);
  }
}
