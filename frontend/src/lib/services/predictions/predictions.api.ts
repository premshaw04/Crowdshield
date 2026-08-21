import { EventSafetyThresholds } from '@/types/event';
import { apiClient } from '../../api/client';
import { IPredictionsService, AIPrediction, EventMetrics } from './predictions.types';

export class PredictionsApi implements IPredictionsService {
  async getEventMetrics(eventId: string): Promise<EventMetrics> {
    return apiClient.get<EventMetrics>(`/events/${eventId}/metrics`);
  }

  async getEventPredictions(eventId: string, thresholds?: EventSafetyThresholds): Promise<AIPrediction> {
    return apiClient.get<AIPrediction>(`/events/${eventId}/predictions`);
  }

  async getCurrentPrediction(eventId: string): Promise<AIPrediction> {
    return apiClient.get<AIPrediction>(`/events/${eventId}/predictions/current`);
  }
}
