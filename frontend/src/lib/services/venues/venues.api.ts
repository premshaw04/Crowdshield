import { Venue, FloorPlan } from '@/types/venue';
import { apiConfig } from '../../api/config';
import { apiClient } from '../../api/client';
import { IVenuesService } from './venues.types';

export class VenuesApi implements IVenuesService {
  async getAllVenues(): Promise<Venue[]> {
    const isDemo = apiConfig.IS_DEMO_MODE;
    const response = await apiClient.get<{ data: Venue[] }>(`/venues?is_demo=${isDemo}`);
    return response.data || response as any;
  }

  async getVenueById(id: string): Promise<Venue | null> {
    try {
      const response = await apiClient.get<{ data: Venue }>(`/venues/${id}`);
      return response.data || response as any;
    } catch (error) {
      console.error(`Failed to fetch venue ${id}`, error);
      return null;
    }
  }

  async createVenue(data: Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Venue> {
    const response = await apiClient.post<{ data: Venue }>('/venues', data);
    return response.data || response as any;
  }

  async updateVenue(id: string, data: Partial<Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Venue> {
    const response = await apiClient.patch<{ data: Venue }>(`/venues/${id}`, data);
    return response.data || response as any;
  }

  async deleteVenue(id: string): Promise<void> {
    await apiClient.delete(`/venues/${id}`);
  }

  async uploadFloorPlan(venueId: string, file: File): Promise<FloorPlan> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.upload<{ data: FloorPlan }>(`/venues/${venueId}/floor-plan`, formData);
    return response.data || response as any;
  }

  async deleteFloorPlan(venueId: string): Promise<void> {
    await apiClient.delete(`/venues/${venueId}/floor-plan`);
  }
}

export const venuesApi = new VenuesApi();
