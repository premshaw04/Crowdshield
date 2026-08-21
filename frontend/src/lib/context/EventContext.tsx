'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event } from '@/types/event';
import { eventService } from '@/lib/services';

interface EventContextProps {
  activeEvent: Event | null;
  setActiveEvent: (event: Event | null) => void;
  isLoading: boolean;
}

const EventContext = createContext<EventContextProps>({
  activeEvent: null,
  setActiveEvent: () => {},
  isLoading: true,
});

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialEvent = async () => {
      try {
        const events = await eventService.getAllEvents();
        const liveEvent = events.find((e: Event) => e.status === 'LIVE') || events[0] || null;
        setActiveEvent(liveEvent);
      } catch (error) {
        console.error('Failed to load initial event', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialEvent();
  }, []);

  return (
    <EventContext.Provider value={{ activeEvent, setActiveEvent, isLoading }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => useContext(EventContext);
