export type CameraStatus = 'live' | 'offline' | 'recording';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface AiMetrics {
  crowdCount: number;
  density: string;
  risk: RiskLevel;
  motionDetected: boolean;
}

export interface MonitoringCamera {
  id: string;
  name: string;
  status: CameraStatus;
  zone: string;
  imageUrl: string;
  videoUrl?: string;
  fps?: number;
  ai?: AiMetrics;
}

export interface MonitoringUpdate {
  cameraId: string;
  fps: number;
  ai: AiMetrics;
}

export interface IMonitoringService {
  getActiveCameras(eventId?: string, zoneId?: string): Promise<MonitoringCamera[]>;
  connectMonitoringStream(eventId: string, onUpdate: (data: MonitoringUpdate) => void): () => void;
}
