import { Venue, FloorPlan } from '@/types/venue';
import { UploadResult } from '../uploads/uploads.types';

export interface IVenuesService {
  getVenueById(id: string): Promise<Venue | null>;
  getAllVenues(): Promise<Venue[]>;
  createVenue(data: Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Venue>;
  updateVenue(id: string, data: Partial<Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Venue>;
  deleteVenue(id: string): Promise<void>;
  
  uploadFloorPlan(venueId: string, file: File): Promise<FloorPlan>;
  deleteFloorPlan(venueId: string): Promise<void>;
}
