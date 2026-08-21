'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import { EventStatus, EventType } from '@/types/event';

export interface EventFilterState {
  status: EventStatus | 'ALL';
  eventType: EventType | 'ALL';
  venue: string | 'ALL';
}

interface EventFiltersProps {
  filters: EventFilterState;
  onFilterChange: (filters: EventFilterState) => void;
  availableVenues: string[];
}

export const EventFilters: React.FC<EventFiltersProps> = ({ filters, onFilterChange, availableVenues }) => {
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, status: e.target.value as EventStatus | 'ALL' });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, eventType: e.target.value as EventType | 'ALL' });
  };

  const handleVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, venue: e.target.value });
  };

  const selectClasses = "bg-[#0c1018] border border-[#1a2334] rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-orange-500/30 focus:ring-1 focus:ring-orange-500/30 appearance-none pr-8 cursor-pointer hover:bg-[#111622] transition-colors shadow-sm";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-slate-500 pr-2">
        <Filter size={16} />
        <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
      </div>
      
      <div className="relative">
        <select value={filters.status} onChange={handleStatusChange} className={selectClasses}>
          <option value="ALL">All Statuses</option>
          <option value="LIVE">Live</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="STARTING">Starting</option>
          <option value="PAUSED">Paused</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="relative">
        <select value={filters.eventType} onChange={handleTypeChange} className={selectClasses}>
          <option value="ALL">All Types</option>
          <option value="SHOPPING">Shopping</option>
          <option value="FESTIVAL">Festival</option>
          <option value="CONCERT">Concert</option>
          <option value="SPORTS">Sports</option>
          <option value="RELIGIOUS">Religious</option>
          <option value="PUBLIC_EVENT">Public Event</option>
          <option value="TRANSPORT">Transport</option>
          <option value="OTHER">Other</option>
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="relative">
        <select value={filters.venue} onChange={handleVenueChange} className={selectClasses}>
          <option value="ALL">All Venues</option>
          {availableVenues.map(venue => (
            <option key={venue} value={venue}>{venue}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
