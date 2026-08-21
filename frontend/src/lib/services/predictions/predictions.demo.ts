import { EventSafetyThresholds } from '@/types/event';
import { IPredictionsService, AIPrediction, EventMetrics } from './predictions.types';

export class PredictionsDemo implements IPredictionsService {
  async getEventMetrics(eventId: string): Promise<EventMetrics> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.debug(`Fetched metrics for event: ${eventId}`);

    return {
      currentDensity: 4.2 + Math.random(),
      currentSpeed: 0.5 - (Math.random() * 0.1),
      currentOccupancyPercent: 65 + (Math.random() * 5),
      entryRate: 1200 + Math.floor(Math.random() * 200),
    };
  }

  async getEventPredictions(eventId: string, thresholds?: EventSafetyThresholds): Promise<AIPrediction> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.debug(`Fetched predictions for event: ${eventId}`);

    const horizon = thresholds?.predictionHorizon || 15;
    
    const baseRisk = 45; // out of 100
    const variance = Math.floor(Math.random() * 20);
    const riskScore = baseRisk + variance;

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScore > 85) severity = 'CRITICAL';
    else if (riskScore > 65) severity = 'HIGH';
    else if (riskScore > 40) severity = 'MEDIUM';

    const confidence = 85 + Math.floor(Math.random() * 12); // 85% - 97%

    const allFactors = [
      'Elevated entry rate detected at Main Gates.',
      'Slight density increase in central gathering zones.',
      'Crowd flow speed dropping below nominal average.',
      'Historical patterns indicate upcoming peak hour.',
      'Minor congestion near primary exits.'
    ];

    const shuffled = allFactors.sort(() => 0.5 - Math.random());
    const contributingFactors = shuffled.slice(0, 2 + Math.floor(Math.random() * 2));

    return {
      riskScore,
      severity,
      predictionHorizonMins: horizon,
      confidence,
      contributingFactors,
      timestamp: new Date().toISOString()
    };
  }

  async getCurrentPrediction(eventId: string): Promise<AIPrediction> {
    return this.getEventPredictions(eventId);
  }
}
