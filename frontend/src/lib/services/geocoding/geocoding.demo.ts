import { IGeocodingService, GeocodingResult } from './geocoding.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_RESULTS: GeocodingResult[] = [
  {
    id: 'geo_1',
    name: 'Phoenix Mall',
    address: '123 Retail Ave',
    city: 'Commerce City',
    state: 'CA',
    country: 'USA',
    latitude: 34.0522,
    longitude: -118.2437
  },
  {
    id: 'geo_2',
    name: 'Metropolis Stadium',
    address: '4500 Arena Blvd',
    city: 'Downtown',
    state: 'NY',
    country: 'USA',
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    id: 'geo_3',
    name: 'Central Plaza',
    address: '890 Civic Center Dr',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    id: 'geo_4',
    name: 'O2 Arena',
    address: 'Peninsula Square',
    city: 'London',
    state: 'England',
    country: 'UK',
    latitude: 51.5030,
    longitude: 0.0032
  },
  {
    id: 'geo_5',
    name: 'Madison Square Garden',
    address: '4 Pennsylvania Plaza',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    latitude: 40.7505,
    longitude: -73.9934
  }
];

export class GeocodingDemo implements IGeocodingService {
  async searchLocation(query: string): Promise<GeocodingResult[]> {
    await delay(800); // Simulate network latency

    if (!query || query.trim() === '') {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    
    return MOCK_RESULTS.filter(r => 
      r.name.toLowerCase().includes(lowerQuery) || 
      r.address.toLowerCase().includes(lowerQuery) ||
      (r.city && r.city.toLowerCase().includes(lowerQuery))
    );
  }
}

export const geocodingDemo = new GeocodingDemo();
