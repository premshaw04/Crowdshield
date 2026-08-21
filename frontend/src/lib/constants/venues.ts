import { Venue } from '@/types/venue';

export const MOCK_VENUES: Venue[] = [
  {
    id: 'v_phoenix',
    name: 'Phoenix Mall',
    address: '123 Retail Ave',
    city: 'Commerce City',
    state: 'CA',
    country: 'USA',
    latitude: 34.0522,
    longitude: -118.2437,
    mapType: 'GEOGRAPHIC',
    floorPlan: {
      id: 'fp_phoenix',
      venueId: 'v_phoenix',
      fileName: 'phoenix_mall.png',
      fileUrl: '/floorplans/phoenix_mall.png',
      width: 1920,
      height: 1080,
      coordinateSystem: 'CRS.Simple',
      createdAt: new Date().toISOString()
    },
    capacity: 35000,
    stats: {
      zones: 6,
      gates: 8,
      cameras: 128,
      sensors: 64
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'v_stadium',
    name: 'Metropolis Stadium',
    address: '4500 Arena Blvd',
    city: 'Downtown',
    state: 'NY',
    country: 'USA',
    latitude: 40.7128,
    longitude: -74.0060,
    mapType: 'GEOGRAPHIC',
    floorPlan: {
      id: 'fp_stadium',
      venueId: 'v_stadium',
      fileName: 'stadium.png',
      fileUrl: '/floorplans/stadium.png',
      width: 2048,
      height: 1536,
      coordinateSystem: 'CRS.Simple',
      createdAt: new Date().toISOString()
    },
    capacity: 65000,
    stats: {
      zones: 12,
      gates: 15,
      cameras: 256,
      sensors: 120
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'v_plaza',
    name: 'Central Plaza',
    address: '890 Civic Center Dr',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    latitude: 37.7749,
    longitude: -122.4194,
    mapType: 'GEOGRAPHIC',
    floorPlan: {
      id: 'fp_plaza',
      venueId: 'v_plaza',
      fileName: 'central_plaza.png',
      fileUrl: '/floorplans/central_plaza.png',
      width: 1280,
      height: 720,
      coordinateSystem: 'CRS.Simple',
      createdAt: new Date().toISOString()
    },
    capacity: 15000,
    stats: {
      zones: 4,
      gates: 4,
      cameras: 45,
      sensors: 20
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
