export interface HeatmapDataPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface ZoneHeatmapUpdate {
  eventId: string;
  venueId: string;
  zoneId: string;
  density: number; // 0.0 to 1.0
  crowdCount: number;
  timestamp: string;
}

export interface IHeatmapService {
  getHeatmapData(eventId: string): Promise<HeatmapDataPoint[]>;
}
