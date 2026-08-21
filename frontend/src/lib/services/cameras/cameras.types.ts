export interface ICamerasService {
  getCameras(): Promise<unknown[]>;
  getCamera(id: string): Promise<unknown | null>;
  createCamera(payload: unknown): Promise<unknown>;
  updateCamera(id: string, payload: unknown): Promise<unknown>;
  deleteCamera(id: string): Promise<unknown>;
}
