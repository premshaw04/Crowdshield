import { Event } from '@/types/event';
import { apiClient } from '../../api/client';
import { apiConfig } from '../../api/config';
import { AuditLogEntry, auditLogService } from '..';
import { IEventsService } from './events.types';

// Helper to map backend snake_case to frontend camelCase
const mapEventResponse = (data: any): Event => {
  return {
    ...data,
    eventType: data.event_type || data.eventType || 'OTHER',
    startTime: data.start_time || data.startTime,
    endTime: data.end_time || data.endTime,
    expectedVisitors: data.expected_visitors || data.expectedVisitors || 0,
    venueId: data.venue_id || data.venueId,
    venueName: data.venue_name || 'Central Plaza (Demo)', // Mock if missing from API
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
  };
};

export class EventsApi implements IEventsService {
  async getAllEvents(): Promise<Event[]> {
    const isDemo = apiConfig.IS_DEMO_MODE;
    const data = await apiClient.get<any[]>(`/events?is_demo=${isDemo}`);
    return data.map(mapEventResponse);
  }

  async getEventById(id: string): Promise<Event | null> {
    const data = await apiClient.get<any>(`/events/${id}`);
    if (!data) return null;
    
    // Fetch zones and videos(cameras) for the event to support the UI
    try {
      const zones = await apiClient.get<any[]>(`/events/${id}/zones`);
      const videos = await apiClient.get<any[]>(`/events/${id}/videos`);
      
      data.zones = zones || [];
      data.cameras = (videos || []).map(v => ({
        id: v.id,
        name: v.file_name,
        type: 'CCTV',
        status: 'ONLINE',
        resolution: '1080p',
        fps: 30,
        associatedZoneId: v.zone_id,
        sourceType: 'UPLOADED_VIDEO',
        videoUrl: v.url
      }));
    } catch (err) {
      console.warn("Failed to fetch event sub-resources", err);
    }
    
    return mapEventResponse(data);
  }

  async createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    // Map camelCase back to snake_case for the API request
    const payload = {
      ...data,
      event_type: data.eventType,
      start_time: data.startTime,
      end_time: data.endTime,
      expected_visitors: data.expectedVisitors,
      venue_id: data.venueId,
    };
    const response = await apiClient.post<any>('/events', payload);
    return mapEventResponse(response);
  }

  async updateEvent(id: string, data: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Event> {
    const payload: any = { ...data };
    if (data.eventType) payload.event_type = data.eventType;
    if (data.startTime) payload.start_time = data.startTime;
    if (data.endTime) payload.end_time = data.endTime;
    if (data.expectedVisitors) payload.expected_visitors = data.expectedVisitors;
    if (data.venueId) payload.venue_id = data.venueId;
    
    const response = await apiClient.patch<any>(`/events/${id}`, payload);
    return mapEventResponse(response);
  }

  async deleteEvent(id: string): Promise<void> {
    return apiClient.delete<void>(`/events/${id}`);
  }

  async startEvent(id: string): Promise<Event> {
    const response = await apiClient.post<any>(`/events/${id}/start`);
    return mapEventResponse(response.event || response); // The start API might return { event_id, status, job } or the event itself.
  }

  async pauseEvent(id: string): Promise<Event> {
    const response = await apiClient.post<any>(`/events/${id}/pause`);
    return mapEventResponse(response);
  }

  async resumeEvent(id: string): Promise<Event> {
    const response = await apiClient.post<any>(`/events/${id}/resume`);
    return mapEventResponse(response);
  }

  async endEvent(id: string): Promise<Event> {
    const response = await apiClient.post<any>(`/events/${id}/end`);
    return mapEventResponse(response);
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
    const response = await apiClient.post<any>(`/events/${originalId}/duplicate`, { name: newName });
    return mapEventResponse(response);
  }
}
