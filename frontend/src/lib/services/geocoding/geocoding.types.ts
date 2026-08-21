export interface GeocodingResult {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export interface IGeocodingService {
  searchLocation(query: string): Promise<GeocodingResult[]>;
}
