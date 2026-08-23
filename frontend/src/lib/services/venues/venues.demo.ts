import { Venue, FloorPlan } from '@/types/venue';
import { IVenuesService } from './venues.types';
import { MOCK_VENUES } from '../../constants/venues';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Shared in-memory DB for Demo Mode
let venuesDb = [...MOCK_VENUES];

export class VenuesDemo implements IVenuesService {
  async getAllVenues(): Promise<Venue[]> {
    await delay(300);
    return [...venuesDb];
  }

  async getVenueById(id: string): Promise<Venue | null> {
    await delay(200);
    const venue = venuesDb.find(v => v.id === id);
    return venue || null;
  }

  async createVenue(data: Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Venue> {
    await delay(400);
    const now = new Date().toISOString();
    const newVenue: Venue = {
      ...data,
      id: `v_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };
    venuesDb = [newVenue, ...venuesDb];
    return newVenue;
  }

  async updateVenue(id: string, data: Partial<Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Venue> {
    await delay(400);
    const index = venuesDb.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error(`Venue with id ${id} not found`);
    }
    
    const updatedVenue: Venue = {
      ...venuesDb[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    venuesDb[index] = updatedVenue;
    return updatedVenue;
  }

  async deleteVenue(id: string): Promise<void> {
    await delay(300);
    venuesDb = venuesDb.filter(v => v.id !== id);
  }

  async uploadFloorPlan(venueId: string, file: File): Promise<FloorPlan> {
    await delay(1500); // Simulate network and processing
    
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = async () => {
        const floorPlan: FloorPlan = {
          id: `fp_${Math.random().toString(36).substr(2, 9)}`,
          venueId,
          fileName: file.name,
          fileUrl: url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          coordinateSystem: 'CRS.Simple',
          createdAt: new Date().toISOString()
        };
        
        // Auto-update the venue in Demo mode
        try {
          await this.updateVenue(venueId, { 
            floorPlan, 
            mapType: 'FLOOR_PLAN' 
          });
        } catch (e) {
          // If venue doesn't exist yet, that's fine, we are just returning the floorplan
        }
        
        resolve(floorPlan);
      };
      img.onerror = () => {
        reject(new Error("Failed to process image"));
      };
      img.src = url;
    });
  }

  async deleteFloorPlan(venueId: string): Promise<void> {
    await delay(400);
    const index = venuesDb.findIndex(v => v.id === venueId);
    if (index !== -1) {
      venuesDb[index] = {
        ...venuesDb[index],
        floorPlan: undefined,
        mapType: 'GEOGRAPHIC',
        updatedAt: new Date().toISOString()
      };
    }
  }
}

export const venuesDemo = new VenuesDemo();
