export interface FloorPlan {
  id: string;
  venueId: string;
  fileName: string;
  fileUrl: string;
  width: number;
  height: number;
  coordinateSystem: string;
  createdAt: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoFeature {
  id: string;
  name: string;
  coordinates: GeoPoint[];
  type: 'POLYGON' | 'POLYLINE' | 'POINT';
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  mapType?: 'GEOGRAPHIC' | 'FLOOR_PLAN';
  floorPlan?: FloorPlan;
  
  // Outdoor Map Configurable Geo-Features
  boundary?: GeoFeature;
  parkingLocations?: GeoFeature[];
  externalGates?: GeoFeature[];
  emergencyAccessRoutes?: GeoFeature[];
  nearbyRoads?: GeoFeature[];

  capacity: number;
  stats: {
    zones: number;
    gates: number;
    cameras: number;
    sensors: number;
  };
  createdAt?: string;
  updatedAt?: string;
}
