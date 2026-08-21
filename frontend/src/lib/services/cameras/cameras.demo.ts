import { ICamerasService } from './cameras.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockCameras: Record<string, unknown>[] = [];

export class CamerasDemo implements ICamerasService {
  async getCameras(): Promise<unknown[]> {
    await delay(200);
    return mockCameras;
  }

  async getCamera(id: string): Promise<unknown | null> {
    await delay(200);
    return mockCameras.find(c => c.id === id) || null;
  }

  async createCamera(payload: unknown): Promise<unknown> {
    await delay(300);
    const newCam = { id: `cam_mock_${Date.now()}`, ...(payload as Record<string, unknown>) };
    mockCameras.push(newCam);
    return newCam;
  }

  async updateCamera(id: string, payload: unknown): Promise<unknown> {
    await delay(300);
    const idx = mockCameras.findIndex(c => c.id === id);
    if (idx !== -1) {
      mockCameras[idx] = { ...mockCameras[idx], ...(payload as Record<string, unknown>) };
      return mockCameras[idx];
    }
    return { id, ...(payload as Record<string, unknown>) };
  }

  async deleteCamera(id: string): Promise<unknown> {
    await delay(300);
    mockCameras = mockCameras.filter(c => c.id !== id);
    return { success: true };
  }
}
