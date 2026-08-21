import { Venue, FloorPlan } from '@/types/venue';
import { apiClient } from '../../api/client';
import { IVenuesService } from './venues.types';

export class VenuesApi implements IVenuesService {
  async getAllVenues(): Promise<Venue[]> {
    const response = await apiClient.get<{ data: Venue[] }>('/api/v1/venues');
    return response.data;
  }

  async getVenueById(id: string): Promise<Venue | null> {
    try {
      const response = await apiClient.get<{ data: Venue }>(`/api/v1/venues/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch venue ${id}`, error);
      return null;
    }
  }

  async createVenue(data: Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Venue> {
    const response = await apiClient.post<{ data: Venue }>('/api/v1/venues', data);
    return response.data;
  }

  async updateVenue(id: string, data: Partial<Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Venue> {
    const response = await apiClient.patch<{ data: Venue }>(`/api/v1/venues/${id}`, data);
    return response.data;
  }

  async deleteVenue(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/venues/${id}`);
  }

  async uploadFloorPlan(venueId: string, file: File): Promise<FloorPlan> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.upload<{ data: FloorPlan }>(`/api/v1/venues/${venueId}/floor-plan`, formData);
    return response.data;
  }

  async deleteFloorPlan(venueId: string): Promise<void> {
    await apiClient.delete(`/api/v1/venues/${venueId}/floor-plan`);
  }
}

export const venuesApi = new VenuesApi();
