import { EventSafetyThresholds } from '@/types/event';
import { apiClient } from '../../api/client';
import { IPredictionsService, AIPrediction, EventMetrics } from './predictions.types';

export class PredictionsApi implements IPredictionsService {
  async getEventMetrics(eventId: string): Promise<EventMetrics> {
    try {
      return await apiClient.get<EventMetrics>(`/events/${eventId}/metrics`);
    } catch (error) {
      console.warn("Failed to fetch metrics", error);
      return {
        visitorCount: 0,
        density: 0,
        flowRate: 0,
        anomaliesDetected: 0,
        historicalData: []
      };
    }
  }

  async getEventPredictions(eventId: string, thresholds?: EventSafetyThresholds): Promise<AIPrediction> {
    try {
      return await apiClient.get<AIPrediction>(`/events/${eventId}/predictions`);
    } catch (error) {
      console.warn("Failed to fetch predictions", error);
      return {
        timestamp: new Date().toISOString(),
        predictedVisitorCount: 0,
        predictedPeakTime: new Date().toISOString(),
        confidenceScore: 0,
        riskLevel: 'LOW',
        recommendedActions: []
      } as AIPrediction;
    }
  }

  async getCurrentPrediction(eventId: string): Promise<AIPrediction> {
    try {
      return await apiClient.get<AIPrediction>(`/events/${eventId}/predictions/current`);
    } catch (error) {
      console.warn("Failed to fetch current prediction", error);
      return {
        timestamp: new Date().toISOString(),
        predictedVisitorCount: 0,
        predictedPeakTime: new Date().toISOString(),
        confidenceScore: 0,
        riskLevel: 'LOW',
        recommendedActions: []
      } as AIPrediction;
    }
  }
}
