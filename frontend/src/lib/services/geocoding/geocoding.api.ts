import { apiClient } from '../../api/client';
import { IGeocodingService, GeocodingResult } from './geocoding.types';

export class GeocodingApi implements IGeocodingService {
  async searchLocation(query: string): Promise<GeocodingResult[]> {
    if (!query || query.trim() === '') {
      return [];
    }
    const response = await apiClient.get<GeocodingResult[]>('/api/v1/geocoding/search', {
      params: { q: query }
    });
    return response;
  }
}

export const geocodingApi = new GeocodingApi();
