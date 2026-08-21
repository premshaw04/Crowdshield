import { Event } from '@/types/event';
import { MOCK_EVENTS } from '../../constants/events';
import { auditLogService, AuditLogEntry } from '..';
import { IEventsService } from './events.types';

// Simulates network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let eventsDb = [...MOCK_EVENTS];

export class EventsDemo implements IEventsService {
  async getAllEvents(): Promise<Event[]> {
    await delay(300);
    return [...eventsDb];
  }

  async getEventById(id: string): Promise<Event | null> {
    await delay(200);
    const event = eventsDb.find(e => e.id === id);
    return event || null;
  }

  async createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    await delay(400);
    const now = new Date().toISOString();
    const newEvent: Event = {
      ...data,
      id: `evt_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };
    eventsDb = [newEvent, ...eventsDb];
    return newEvent;
  }

  async updateEvent(id: string, data: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Event> {
    await delay(400);
    const index = eventsDb.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Event with id ${id} not found`);
    }
    
    const updatedEvent: Event = {
      ...eventsDb[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Log status changes
    if (data.status && data.status !== eventsDb[index].status) {
      auditLogService.logAction({
        eventId: id,
        actor: 'System Admin',
        role: 'Authority',
        action: `Event status changed to ${data.status}`,
        target: 'Event Lifecycle',
        result: 'SUCCESS'
      });
    }
    
    eventsDb[index] = updatedEvent;
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await delay(300);
    const initialLength = eventsDb.length;
    eventsDb = eventsDb.filter(e => e.id !== id);
    if (eventsDb.length === initialLength) {
      throw new Error(`Event with id ${id} not found`);
    }
  }

  async startEvent(id: string): Promise<Event> {
    return this.updateEvent(id, { status: 'LIVE' });
  }

  async pauseEvent(id: string): Promise<Event> {
    return this.updateEvent(id, { status: 'PAUSED' });
  }

  async resumeEvent(id: string): Promise<Event> {
    return this.updateEvent(id, { status: 'LIVE' });
  }

  async endEvent(id: string): Promise<Event> {
    return this.updateEvent(id, { status: 'COMPLETED' });
  }

  async getEventMetrics(id: string): Promise<unknown> {
    await delay(200);
    return {};
  }

  async getEventAlerts(id: string): Promise<unknown[]> {
    await delay(200);
    return [];
  }

  async getEventIncidents(id: string): Promise<unknown[]> {
    await delay(200);
    return [];
  }

  async getEventReport(id: string): Promise<unknown> {
    await delay(200);
    return {};
  }

  async getEventAuditLog(id: string): Promise<AuditLogEntry[]> {
    await delay(200);
    return auditLogService.getEventAuditLogs(id);
  }

  async duplicateEvent(originalId: string, newName: string): Promise<Event> {
    await delay(500);
    
    const originalEvent = eventsDb.find(e => e.id === originalId);
    if (!originalEvent) {
      throw new Error(`Event with id ${originalId} not found`);
    }

    const now = new Date().toISOString();
    
    const duplicatedEvent: Event = {
      id: `evt_dup_${Math.random().toString(36).substr(2, 9)}`,
      name: newName,
      description: originalEvent.description,
      eventType: originalEvent.eventType,
      expectedVisitors: originalEvent.expectedVisitors,
      createdBy: originalEvent.createdBy,
      venueId: originalEvent.venueId,
      venueName: originalEvent.venueName,
      zones: JSON.parse(JSON.stringify(originalEvent.zones)),
      gates: JSON.parse(JSON.stringify(originalEvent.gates)),
      cameras: JSON.parse(JSON.stringify(originalEvent.cameras)),
      safetyThresholds: JSON.parse(JSON.stringify(originalEvent.safetyThresholds)),
      startTime: originalEvent.startTime,
      endTime: originalEvent.endTime,
      createdAt: now,
      updatedAt: now,
      status: 'UPCOMING',
    };

    eventsDb = [duplicatedEvent, ...eventsDb];
    return duplicatedEvent;
  }
}
