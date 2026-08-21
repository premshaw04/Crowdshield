'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, AlertCircle } from 'lucide-react';
import { eventService } from '@/lib/services';
import { Event } from '@/types/event';
import { EventTable } from '@/components/widgets/events/EventTable';
import { EventSearch } from '@/components/widgets/events/EventSearch';
import { EventFilters, EventFilterState } from '@/components/widgets/events/EventFilters';

export default function EventsDashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<EventFilterState>({
    status: 'ALL',
    eventType: 'ALL',
    venue: 'ALL'
  });

  // Sort State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'startTime',
    direction: 'asc'
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await eventService.getAllEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const availableVenues = useMemo(() => {
    const venues = new Set(events.map(e => e.venueName));
    return Array.from(venues).sort();
  }, [events]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedEvents = useMemo(() => {
    // 1. Filter
    let result = events.filter(event => {
      const matchSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.venueName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filters.status === 'ALL' || event.status === filters.status;
      const matchType = filters.eventType === 'ALL' || event.eventType === filters.eventType;
      const matchVenue = filters.venue === 'ALL' || event.venueName === filters.venue;

      return matchSearch && matchStatus && matchType && matchVenue;
    });

    // 2. Sort
    result = result.sort((a, b) => {
      const aVal = a[sortConfig.key as keyof Event];
      const bVal = b[sortConfig.key as keyof Event];

      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [events, searchTerm, filters, sortConfig]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#182130]">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Events
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage crowd-monitoring operations and venue events.</p>
        </div>
        <Link 
          href="/dashboard/events/create"
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg transition-all shadow shadow-orange-900/20"
        >
          <Plus size={16} />
          New Event
        </Link>
      </div>
      
      {/* Controls: Search and Filters */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-[#0c1018]/50 p-4 rounded-xl border border-[#1a2334]">
        <EventSearch onSearch={setSearchTerm} />
        <EventFilters filters={filters} onFilterChange={setFilters} availableVenues={availableVenues} />
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="h-64 flex flex-col gap-4 items-center justify-center border border-[#1a2334] rounded-xl bg-[#0c1018]">
            <div className="w-6 h-6 border-2 border-slate-600/30 border-t-slate-400 rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-slate-500">Loading events...</span>
          </div>
        ) : error ? (
          <div className="p-8 flex flex-col items-center justify-center text-center border border-[#1a2334] rounded-xl bg-[#0c1018]">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-slate-200 font-semibold mb-1">Unable to load events</h2>
            <p className="text-slate-500 text-sm">{error}</p>
          </div>
        ) : (
          <EventTable 
            events={filteredAndSortedEvents} 
            onSort={handleSort}
            sortKey={sortConfig.key}
            sortDirection={sortConfig.direction}
          />
        )}
      </div>
    </div>
  );
}
