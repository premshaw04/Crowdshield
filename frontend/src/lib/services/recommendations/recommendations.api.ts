import { apiClient } from '../../api/client';
import { IRecommendationsService, AIRecommendation } from './recommendations.types';

export class RecommendationsApi implements IRecommendationsService {
  async getEventRecommendations(eventId: string): Promise<AIRecommendation[]> {
    return apiClient.get<AIRecommendation[]>(`/events/${eventId}/recommendations`);
  }

  async approveRecommendation(eventId: string, id: string): Promise<AIRecommendation> {
    return apiClient.post<AIRecommendation>(`/events/${eventId}/recommendations/${id}/approve`);
  }

  async rejectRecommendation(eventId: string, id: string): Promise<AIRecommendation> {
    return apiClient.post<AIRecommendation>(`/events/${eventId}/recommendations/${id}/reject`);
  }

  async executeRecommendation(eventId: string, id: string): Promise<AIRecommendation> {
    return apiClient.post<AIRecommendation>(`/events/${eventId}/recommendations/${id}/execute`);
  }
}
