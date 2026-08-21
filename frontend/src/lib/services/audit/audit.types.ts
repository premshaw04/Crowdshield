export interface AuditLogEntry {
  id: string;
  eventId: string;
  timestamp: string; // ISO string
  actor: string;
  role: string;
  action: string;
  target: string;
  result: 'SUCCESS' | 'FAILED' | 'PENDING';
}

export interface IAuditLogService {
  getEventAuditLogs(eventId: string): Promise<AuditLogEntry[]>;
  logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void>;
}
