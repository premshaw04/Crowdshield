import { apiClient } from '../../api/client';
import { apiConfig } from '../../api/config';
import { WebSocketClient } from '../../websocket/client';
import { IMonitoringService, MonitoringCamera, MonitoringUpdate } from './monitoring.types';

export class MonitoringApi implements IMonitoringService {
  async getActiveCameras(eventId?: string, zoneId?: string): Promise<MonitoringCamera[]> {
    let query = '';
    if (eventId || zoneId) {
      const params = new URLSearchParams();
      if (eventId) params.append('eventId', eventId);
      if (zoneId) params.append('zoneId', zoneId);
      query = `?${params.toString()}`;
    }
    return apiClient.get<MonitoringCamera[]>(`/monitoring/cameras${query}`);
  }

  connectMonitoringStream(eventId: string, onUpdate: (data: MonitoringUpdate) => void): () => void {
    const wsClient = WebSocketClient.getInstance(`/monitoring/${eventId}`);
    
    const unsubscribe = wsClient.subscribe('*', (message: unknown) => {
      // The wildcard listener gets the raw parsed message
      if (message && typeof message === 'object') {
        onUpdate(message as MonitoringUpdate);
      }
    });

    wsClient.connect();

    return () => {
      unsubscribe();
      // We don't necessarily destroy the instance on unmount in case other components
      // are also listening to the same eventId stream.
    };
  }
}
