import { auditLogService } from '..';
import { IRecommendationsService, AIRecommendation } from './recommendations.types';

const recommendationsDb: Record<string, AIRecommendation[]> = {};

export class RecommendationsDemo implements IRecommendationsService {
  async getEventRecommendations(eventId: string): Promise<AIRecommendation[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    if (!recommendationsDb[eventId]) {
      recommendationsDb[eventId] = [
        {
          id: 'rec_101',
          eventId,
          type: 'GATE_CONTROL',
          target: 'Gate 5',
          reason: 'High density detected in Zone B. Opening gate will reduce congestion by 18%.',
          confidence: 94,
          expectedEffect: 'Reduce density in Zone B',
          status: 'PENDING',
          isHighUrgency: true,
        },
        {
          id: 'rec_102',
          eventId,
          type: 'GATE_CONTROL',
          target: 'Gate 2',
          reason: 'Main entrance is approaching critical occupancy rate.',
          confidence: 91,
          expectedEffect: 'Stop incoming crowd',
          status: 'PENDING',
          isHighUrgency: false,
        },
        {
          id: 'rec_103',
          eventId,
          type: 'PERSONNEL_DEPLOYMENT',
          target: 'Zone B & Food Court',
          reason: 'Projected crowd surge requires immediate physical presence.',
          confidence: 87,
          expectedEffect: 'Deploy 8 Security Officers',
          status: 'PENDING',
          isHighUrgency: true,
        },
        {
          id: 'rec_104',
          eventId,
          type: 'SYSTEM_BROADCAST',
          target: 'West Wing Exits',
          reason: 'Optimal diversion path to relieve central congestion.',
          confidence: 89,
          expectedEffect: 'Broadcast Diversion Alert',
          status: 'PENDING',
          isHighUrgency: false,
        },
      ];
    }
    return recommendationsDb[eventId];
  }

  async approveRecommendation(eventId: string, id: string): Promise<AIRecommendation> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const recs = recommendationsDb[eventId];
    if (recs) {
      const idx = recs.findIndex(r => r.id === id);
      if (idx !== -1) {
        recs[idx].status = 'APPROVED';
        
        auditLogService.logAction({
          eventId,
          actor: 'System Admin',
          role: 'Authority',
          action: `Approved: ${recs[idx].expectedEffect}`,
          target: recs[idx].target,
          result: 'SUCCESS'
        });
        
        return recs[idx];
      }
    }
    
    throw new Error('Recommendation not found');
  }

  async rejectRecommendation(eventId: string, id: string): Promise<AIRecommendation> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const recs = recommendationsDb[eventId];
    if (recs) {
      const idx = recs.findIndex(r => r.id === id);
      if (idx !== -1) {
        recs[idx].status = 'REJECTED';
        
        auditLogService.logAction({
          eventId,
          actor: 'System Admin',
          role: 'Authority',
          action: `Rejected: ${recs[idx].expectedEffect}`,
          target: recs[idx].target,
          result: 'SUCCESS'
        });
        
        return recs[idx];
      }
    }
    throw new Error('Recommendation not found');
  }

  async executeRecommendation(eventId: string, id: string): Promise<AIRecommendation> {
    const recs = recommendationsDb[eventId];
    if (recs) {
      const idx = recs.findIndex(r => r.id === id);
      if (idx !== -1) {
        if (recs[idx].status !== 'APPROVED') {
          throw new Error('Cannot execute an unapproved recommendation');
        }
        recs[idx].status = 'COMPLETED';
        
        auditLogService.logAction({
          eventId,
          actor: 'System Admin',
          role: 'Authority',
          action: `Executed: ${recs[idx].expectedEffect}`,
          target: recs[idx].target,
          result: 'SUCCESS'
        });
        
        return recs[idx];
      }
    }
    throw new Error('Recommendation not found');
  }
}
