import { apiClient } from '../../api/client';
import { ICamerasService } from './cameras.types';

export class CamerasApi implements ICamerasService {
  async getCameras(): Promise<unknown[]> {
    return apiClient.get('/cameras');
  }

  async getCamera(id: string): Promise<unknown | null> {
    return apiClient.get(`/cameras/${id}`);
  }

  async createCamera(payload: unknown): Promise<unknown> {
    return apiClient.post('/cameras', payload);
  }

  async updateCamera(id: string, payload: unknown): Promise<unknown> {
    return apiClient.patch(`/cameras/${id}`, payload);
  }

  async deleteCamera(id: string): Promise<unknown> {
    return apiClient.delete(`/cameras/${id}`);
  }
}
