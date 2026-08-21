import { EventSafetyThresholds } from '@/types/event';

export interface AIPrediction {
  riskScore: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  predictionHorizonMins: number;
  confidence: number;
  contributingFactors: string[];
  timestamp: string;
}

export interface EventMetrics {
  currentDensity: number;
  currentSpeed: number;
  currentOccupancyPercent: number;
  entryRate: number;
}

export interface IPredictionsService {
  getEventMetrics(eventId: string): Promise<EventMetrics>;
  getEventPredictions(eventId: string, thresholds?: EventSafetyThresholds): Promise<AIPrediction>;
  getCurrentPrediction(eventId: string): Promise<AIPrediction>;
}
