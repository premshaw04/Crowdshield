import { IMonitoringService, MonitoringCamera, MonitoringUpdate, RiskLevel } from './monitoring.types';
import { videosApi, VideoRecord } from '..';
import { WebSocketClient } from '../../websocket/client';
import { WebSocketEventType } from '../../websocket/events';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_CAMERAS: MonitoringCamera[] = [
  { id: 'c1', name: 'Main Entrance', status: 'live', zone: 'Zone A', imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80', fps: 30, ai: { crowdCount: 42, density: '8.2/m²', risk: 'High', motionDetected: true } },
  { id: 'c2', name: 'Food Court', status: 'live', zone: 'Zone B', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80', fps: 28, ai: { crowdCount: 120, density: '9.5/m²', risk: 'High', motionDetected: true } },
  { id: 'c3', name: 'Parking Area', status: 'recording', zone: 'Zone C', imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80', fps: 24, ai: { crowdCount: 15, density: '2.1/m²', risk: 'Low', motionDetected: false } },
  { id: 'c4', name: 'West Wing', status: 'live', zone: 'Zone A', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80', fps: 30, ai: { crowdCount: 25, density: '4.5/m²', risk: 'Medium', motionDetected: true } },
  { id: 'c5', name: 'Ground Floor', status: 'offline', zone: 'Zone B', imageUrl: '' },
  { id: 'c6', name: 'Billing Counter', status: 'live', zone: 'Zone C', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80', fps: 29, ai: { crowdCount: 35, density: '7.1/m²', risk: 'Medium', motionDetected: true } },
];

export class MonitoringDemo implements IMonitoringService {
  async getActiveCameras(eventId?: string, zoneId?: string): Promise<MonitoringCamera[]> {
    await delay(500);
    let filtered = [...MOCK_CAMERAS];
    
    // Bridge uploaded videos from the Event dashboard
    const uploadedVideos = await videosApi.getAllVideos();
    const readyVideos = uploadedVideos.filter((v: VideoRecord) => v.status === 'ready' && v.url);
    
    const videoCameras: MonitoringCamera[] = readyVideos.map((v: VideoRecord, idx: number) => ({
      id: `cam_vid_${v.id}`,
      name: v.cameraLabel || `Custom Feed ${idx + 1}`,
      status: 'live',
      zone: v.zoneId || 'Unassigned',
      imageUrl: '', 
      videoUrl: v.url,
      fps: 30,
      ai: { crowdCount: 0, density: '0/m²', risk: 'Low', motionDetected: false } // Initial state before WS
    }));
    
    filtered = [...filtered, ...videoCameras];

    if (zoneId && zoneId !== 'All Zones') {
      filtered = filtered.filter(c => c.zone === zoneId);
    }
    return filtered;
  }

  connectMonitoringStream(eventId: string, onUpdate: (data: MonitoringUpdate) => void): () => void {
    const interval = setInterval(async () => {
      // Need to bridge the uploaded videos here too so they get fake AI telemetry
      const uploadedVideos = await videosApi.getAllVideos();
      const readyVideos = uploadedVideos.filter((v: VideoRecord) => v.status === 'ready' && v.url);
      
      const videoCameras: MonitoringCamera[] = readyVideos.map((v: VideoRecord) => ({
        id: `cam_vid_${v.id}`,
        name: v.cameraLabel || 'Custom Feed',
        status: 'live',
        zone: v.zoneId || 'Unassigned',
        imageUrl: '', 
        videoUrl: v.url,
        fps: 30,
        ai: { crowdCount: 45, density: '4.5/m²', risk: 'Medium', motionDetected: true }
      }));

      const activeSimCameras = [...MOCK_CAMERAS, ...videoCameras].filter(c => c.status !== 'offline');
      if (activeSimCameras.length === 0) return;

      // Pick a random live camera and fluctuate its stats slightly
      const randomCam = activeSimCameras[Math.floor(Math.random() * activeSimCameras.length)];
      
      if (!randomCam.ai) return;

      const variance = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const newCount = Math.max(0, randomCam.ai.crowdCount + variance);
      const newDensityNum = (newCount / 10).toFixed(1);
      
      let newRisk: RiskLevel = 'Low';
      if (newCount > 100) newRisk = 'High';
      else if (newCount > 30) newRisk = 'Medium';

      onUpdate({
        cameraId: randomCam.id,
        fps: Math.floor(Math.random() * 5) + 26, // 26-30 fps
        ai: {
          crowdCount: newCount,
          density: `${newDensityNum}/m²`,
          risk: newRisk,
          motionDetected: Math.random() > 0.3 // 70% chance of motion
        }
      });

      // Simulate a real-time alert generation (5% chance per tick)
      if (Math.random() < 0.05) {
        WebSocketClient.getInstance().simulateMessage({
          type: WebSocketEventType.ALERT_CREATED,
          payload: {
            id: `alert_rt_${Math.floor(Math.random() * 10000)}`,
            eventId,
            severity: newRisk === 'High' ? 'CRITICAL' : 'HIGH',
            location: randomCam.name,
            message: 'Real-time AI anomaly detected',
            timestamp: new Date().toISOString(),
            status: 'ACTIVE'
          }
        });
      }
    }, 1000); // 1Hz telemetry

    return () => clearInterval(interval);
  }
}
