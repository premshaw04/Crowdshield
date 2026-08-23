import { apiClient } from '../../api/client';
import { IAuditLogService, AuditLogEntry } from './audit.types';

export class AuditLogApi implements IAuditLogService {
  async getEventAuditLogs(eventId: string): Promise<AuditLogEntry[]> {
    try {
      return await apiClient.get<AuditLogEntry[]>(`/events/${eventId}/audit-logs`);
    } catch (error) {
      console.warn("Failed to fetch audit logs, returning empty array", error);
      return [];
    }
  }

  async logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    return apiClient.post(`/events/${entry.eventId}/audit-logs`, entry);
  }
}
