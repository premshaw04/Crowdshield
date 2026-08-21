import { apiClient } from '../../api/client';
import { IHeatmapService, HeatmapDataPoint } from './heatmap.types';

export class HeatmapApi implements IHeatmapService {
  async getHeatmapData(eventId: string): Promise<HeatmapDataPoint[]> {
    return apiClient.get<HeatmapDataPoint[]>(`/heatmap/events/${eventId}`);
  }
}
