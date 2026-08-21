import { Event } from '@/types/event';
import type { AuditLogEntry } from '..';

export interface IEventsService {
  getAllEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | null>;
  createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event>;
  updateEvent(id: string, data: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  startEvent(id: string): Promise<Event>;
  pauseEvent(id: string): Promise<Event>;
  resumeEvent(id: string): Promise<Event>;
  endEvent(id: string): Promise<Event>;
  getEventMetrics(id: string): Promise<unknown>;
  getEventAlerts(id: string): Promise<unknown[]>;
  getEventIncidents(id: string): Promise<unknown[]>;
  getEventReport(id: string): Promise<unknown>;
  getEventAuditLog(id: string): Promise<AuditLogEntry[]>;
  duplicateEvent(originalId: string, newName: string): Promise<Event>;
}
