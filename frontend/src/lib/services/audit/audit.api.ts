import { apiClient } from '../../api/client';
import { IAuditLogService, AuditLogEntry } from './audit.types';

export class AuditLogApi implements IAuditLogService {
  async getEventAuditLogs(eventId: string): Promise<AuditLogEntry[]> {
    return apiClient.get<AuditLogEntry[]>(`/events/${eventId}/audit-logs`);
  }

  async logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    return apiClient.post(`/events/${entry.eventId}/audit-logs`, entry);
  }
}
