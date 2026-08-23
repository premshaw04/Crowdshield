import { IHeatmapService, HeatmapDataPoint } from './heatmap.types';

export class HeatmapDemo implements IHeatmapService {
  async getHeatmapData(eventId: string): Promise<HeatmapDataPoint[]> {
    // Demo mode returning empty for now as in the original mock
    return [];
  }
}
