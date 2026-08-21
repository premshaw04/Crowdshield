export type EventStatus = 'UPCOMING' | 'STARTING' | 'LIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export type EventType = 
  | 'SHOPPING' 
  | 'FESTIVAL' 
  | 'CONCERT' 
  | 'SPORTS' 
  | 'RELIGIOUS' 
  | 'PUBLIC_EVENT' 
  | 'TRANSPORT' 
  | 'OTHER';

export interface EventZone {
  id: string;
  name: string;
  capacity: number;
  areaSqM: number;
  warningDensity: number;
  highDensity: number;
  criticalDensity: number;
}

export interface EventGate {
  id: string;
  name: string;
  gateNumber: number;
  type: 'ENTRY' | 'EXIT' | 'BOTH' | 'EMERGENCY' | 'SERVICE';
  capacityPerHour: number;
  initialState: 'OPEN' | 'CLOSED';
  associatedZoneId?: string;
}

export interface EventCamera {
  id: string;
  name: string;
  associatedZoneId?: string;
  status: 'ONLINE' | 'OFFLINE';
  sourceType: 'DEMO_VIDEO' | 'UPLOADED_VIDEO' | 'RTSP' | 'IP_CAMERA';
  videoUrl?: string;
}

export interface EventSafetyThresholds {
  warningDensity: number;
  highDensity: number;
  criticalDensity: number;
  minCrowdSpeed: number;
  maxZoneOccupancy: number;
  maxEntryRate: number;
  predictionHorizon: number;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  venueId: string;
  venueName: string;
  eventType: EventType;
  startTime: string; // ISO 8601 string
  endTime: string;   // ISO 8601 string
  expectedVisitors: number;
  status: EventStatus;
  createdBy: string;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  
  // Optional live telemetry metrics for UI display
  currentVisitors?: number;
  riskLevel?: string; // e.g. "82% HIGH"

  // Advanced Configurations (from wizard)
  estimatedPeakVisitors?: number;
  organizer?: string;
  emergencyContact?: string;
  zones?: EventZone[];
  gates?: EventGate[];
  cameras?: EventCamera[];
  safetyThresholds?: EventSafetyThresholds;
}
