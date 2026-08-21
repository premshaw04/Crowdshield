import { Event } from '@/types/event';
import { apiClient } from '../../api/client';
import { AuditLogEntry, auditLogService } from '..';
import { IEventsService } from './events.types';

export class EventsApi implements IEventsService {
  async getAllEvents(): Promise<Event[]> {
    return apiClient.get<Event[]>('/events');
  }

  async getEventById(id: string): Promise<Event | null> {
    return apiClient.get<Event>(`/events/${id}`);
  }

  async createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    return apiClient.post<Event>('/events', data);
  }

  async updateEvent(id: string, data: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Event> {
    return apiClient.patch<Event>(`/events/${id}`, data);
  }

  async deleteEvent(id: string): Promise<void> {
    return apiClient.delete<void>(`/events/${id}`);
  }

  async startEvent(id: string): Promise<Event> {
    return apiClient.post<Event>(`/events/${id}/start`);
  }

  async pauseEvent(id: string): Promise<Event> {
    return apiClient.post<Event>(`/events/${id}/pause`);
  }

  async resumeEvent(id: string): Promise<Event> {
    return apiClient.post<Event>(`/events/${id}/resume`);
  }

  async endEvent(id: string): Promise<Event> {
    return apiClient.post<Event>(`/events/${id}/end`);
  }

  async getEventMetrics(id: string): Promise<unknown> {
    return apiClient.get(`/events/${id}/metrics`);
  }

  async getEventAlerts(id: string): Promise<unknown[]> {
    return apiClient.get(`/events/${id}/alerts`);
  }

  async getEventIncidents(id: string): Promise<unknown[]> {
    return apiClient.get(`/events/${id}/incidents`);
  }

  async getEventReport(id: string): Promise<unknown> {
    return apiClient.get(`/events/${id}/report`);
  }

  async getEventAuditLog(id: string): Promise<AuditLogEntry[]> {
    return apiClient.get<AuditLogEntry[]>(`/events/${id}/audit-log`);
  }

  async duplicateEvent(originalId: string, newName: string): Promise<Event> {
    return apiClient.post<Event>(`/events/${originalId}/duplicate`, { name: newName });
  }
}
