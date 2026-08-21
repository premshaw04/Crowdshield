import { apiClient } from '../../api/client';
import { IGatesService, Gate, GateStatus } from './gates.types';

export class GatesApi implements IGatesService {
  async getGates(): Promise<Gate[]> {
    return apiClient.get<Gate[]>('/gates');
  }

  async getEventGates(eventId: string): Promise<Gate[]> {
    return apiClient.get<Gate[]>(`/events/${eventId}/gates`);
  }

  async getGateStatus(gateId: string): Promise<{ status: GateStatus }> {
    return apiClient.get<{ status: GateStatus }>(`/gates/${gateId}/status`);
  }

  async openGate(gateId: string): Promise<Gate> {
    return apiClient.post<Gate>(`/gates/${gateId}/open`);
  }

  async closeGate(gateId: string): Promise<Gate> {
    return apiClient.post<Gate>(`/gates/${gateId}/close`);
  }
}
