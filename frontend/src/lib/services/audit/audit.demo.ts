import { IAuditLogService, AuditLogEntry } from './audit.types';

const auditLogsDb: Record<string, AuditLogEntry[]> = {};

export class AuditLogDemo implements IAuditLogService {
  async getEventAuditLogs(eventId: string): Promise<AuditLogEntry[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!auditLogsDb[eventId]) {
      const now = new Date();
      const timeAgo = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

      auditLogsDb[eventId] = [
        {
          id: 'log_007',
          eventId,
          timestamp: timeAgo(2),
          actor: 'Prem Kumar',
          role: 'Authority',
          action: 'Approved: Deploy 8 Security Officers',
          target: 'Zone B & Food Court',
          result: 'SUCCESS',
        },
        {
          id: 'log_006',
          eventId,
          timestamp: timeAgo(3),
          actor: 'System AI',
          role: 'System',
          action: 'AI Recommendation Generated',
          target: 'Security Deployment',
          result: 'SUCCESS',
        },
        {
          id: 'log_005',
          eventId,
          timestamp: timeAgo(15),
          actor: 'Prem Kumar',
          role: 'Authority',
          action: 'Approved: Open Exit Gate 5',
          target: 'Gate 5',
          result: 'SUCCESS',
        },
        {
          id: 'log_004',
          eventId,
          timestamp: timeAgo(16),
          actor: 'System AI',
          role: 'System',
          action: 'AI Recommendation Generated',
          target: 'Gate Control',
          result: 'SUCCESS',
        },
        {
          id: 'log_003',
          eventId,
          timestamp: timeAgo(45),
          actor: 'Prem Kumar',
          role: 'Authority',
          action: 'Event Started',
          target: 'Event Lifecycle',
          result: 'SUCCESS',
        },
        {
          id: 'log_002',
          eventId,
          timestamp: timeAgo(60),
          actor: 'Jane Doe',
          role: 'Admin',
          action: 'Event Configured',
          target: 'Event Settings',
          result: 'SUCCESS',
        },
        {
          id: 'log_001',
          eventId,
          timestamp: timeAgo(120),
          actor: 'Jane Doe',
          role: 'Admin',
          action: 'Event Created',
          target: 'Event Creation',
          result: 'SUCCESS',
        },
      ];
    }

    return auditLogsDb[eventId];
  }

  async logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    if (!auditLogsDb[entry.eventId]) {
      auditLogsDb[entry.eventId] = [];
    }

    const newLog: AuditLogEntry = {
      ...entry,
      id: `log_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    // Prepend to array
    auditLogsDb[entry.eventId] = [newLog, ...auditLogsDb[entry.eventId]];
  }
}
