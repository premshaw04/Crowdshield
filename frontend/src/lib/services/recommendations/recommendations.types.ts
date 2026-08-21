export type RecommendationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';

export interface AIRecommendation {
  id: string;
  eventId: string;
  type: string;
  target: string;
  reason: string;
  confidence: number;
  expectedEffect: string;
  status: RecommendationStatus;
  isHighUrgency?: boolean;
}

export interface IRecommendationsService {
  getEventRecommendations(eventId: string): Promise<AIRecommendation[]>;
  approveRecommendation(eventId: string, id: string): Promise<AIRecommendation>;
  rejectRecommendation(eventId: string, id: string): Promise<AIRecommendation>;
  executeRecommendation(eventId: string, id: string): Promise<AIRecommendation>;
}
