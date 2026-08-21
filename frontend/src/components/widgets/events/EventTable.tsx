'use client';

import React from 'react';
import { Event } from '@/types/event';
import { EventStatusBadge, EventRiskBadge } from './EventBadges';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface EventTableProps {
  events: Event[];
  onSort: (key: keyof Event | 'currentVisitors' | 'riskLevel') => void;
  sortKey: string;
  sortDirection: 'asc' | 'desc';
}

export const EventTable: React.FC<EventTableProps> = ({ events, onSort, sortKey, sortDirection }) => {
  const router = useRouter();

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
    return (
      <span className="text-orange-400">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const thClass = "px-4 py-4 font-semibold group cursor-pointer hover:text-slate-300 transition-colors select-none";

  return (
    <div className="bg-[#111622] border border-[#1a2334] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#182130] bg-[#0c1018]/50 text-[10px] uppercase tracking-wider text-slate-500">
              <th className={thClass} onClick={() => onSort('name')}>
                <div className="flex items-center gap-1.5">Event Name {renderSortIcon('name')}</div>
              </th>
              <th className={thClass} onClick={() => onSort('venueName')}>
                <div className="flex items-center gap-1.5">Venue {renderSortIcon('venueName')}</div>
              </th>
              <th className={thClass} onClick={() => onSort('eventType')}>
                <div className="flex items-center gap-1.5">Event Type {renderSortIcon('eventType')}</div>
              </th>
              <th className={thClass} onClick={() => onSort('startTime')}>
                <div className="flex items-center gap-1.5">Date & Time {renderSortIcon('startTime')}</div>
              </th>
              <th className={`${thClass} text-right`} onClick={() => onSort('expectedVisitors')}>
                <div className="flex items-center justify-end gap-1.5">Est. Crowd {renderSortIcon('expectedVisitors')}</div>
              </th>
              <th className={`${thClass} text-right`} onClick={() => onSort('currentVisitors')}>
                <div className="flex items-center justify-end gap-1.5">Current {renderSortIcon('currentVisitors')}</div>
              </th>
              <th className={`${thClass} text-center`} onClick={() => onSort('riskLevel')}>
                <div className="flex items-center justify-center gap-1.5">Risk {renderSortIcon('riskLevel')}</div>
              </th>
              <th className={`${thClass} text-center`} onClick={() => onSort('status')}>
                <div className="flex items-center justify-center gap-1.5">Status {renderSortIcon('status')}</div>
              </th>
              <th className="px-4 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#182130]">
            {events.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500 space-y-3">
                    <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-sm font-medium">No events found matching your criteria.</span>
                  </div>
                </td>
              </tr>
            ) : (
              events.map((event) => {
                const start = formatDate(event.startTime);
                
                return (
                  <tr 
                    key={event.id} 
                    className="hover:bg-[#1a2334]/50 transition-colors duration-200 group cursor-pointer"
                    onClick={() => router.push(`/dashboard/events/${event.id}`)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors">{event.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">{event.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-300">
                      {event.venueName}
                    </td>
                    <td className="px-4 py-4 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {event.eventType.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-xs">
                        <span className="text-slate-200 font-medium">{start.date}</span>
                        <span className="text-slate-500">{start.time}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-xs font-mono font-semibold text-slate-300">
                        {event.expectedVisitors.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`text-xs font-mono font-bold ${event.currentVisitors ? 'text-white' : 'text-slate-600'}`}>
                        {event.currentVisitors ? event.currentVisitors.toLocaleString() : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <EventRiskBadge riskLevel={event.riskLevel} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <EventStatusBadge status={event.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex p-1.5 rounded-lg hover:bg-[#212b3e] text-slate-400 hover:text-slate-200 transition-colors border-none outline-none focus:outline-none">
                            <MoreHorizontal size={16} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-[#111622] border-[#212b3e] text-slate-300 shadow-xl shadow-black/50">
                            
                            <DropdownMenuItem className="focus:bg-[#1a2334] focus:text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/events/${event.id}`); }}>
                              Open
                            </DropdownMenuItem>

                            {event.status === 'UPCOMING' && (
                              <>
                                <DropdownMenuItem className="focus:bg-[#1a2334] focus:text-white cursor-pointer">Edit</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-[#1a2334] focus:text-white cursor-pointer">Start</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-[#1a2334] focus:text-white cursor-pointer">Duplicate</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#1f293d]" />
                                <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-950/40 cursor-pointer">Cancel</DropdownMenuItem>
                              </>
                            )}

                            {event.status === 'LIVE' && (
                              <>
                                <DropdownMenuItem className="focus:bg-[#1a2334] focus:text-white cursor-pointer">Monitoring</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-[#1a2334] focus:text-white cursor-pointer">Pause</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#1f293d]" />
                                <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-950/40 cursor-pointer">End</DropdownMenuItem>
                              </>
                            )}

                            {event.status === 'PAUSED' && (
                              <>
                                <DropdownMenuItem className="focus:bg-[#1a2334] focus:text-white cursor-pointer">Resume</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#1f293d]" />
                                <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-950/40 cursor-pointer">End</DropdownMenuItem>
                              </>
                            )}

                            {event.status === 'COMPLETED' && (
                              <>
                                <DropdownMenuItem className="focus:bg-[#1a2334] focus:text-white cursor-pointer">Report</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-[#1a2334] focus:text-white cursor-pointer">Audit Log</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-[#1a2334] focus:text-white cursor-pointer">Duplicate</DropdownMenuItem>
                              </>
                            )}

                            {event.status === 'CANCELLED' && (
                              <>
                                <DropdownMenuItem className="focus:bg-[#1a2334] focus:text-white cursor-pointer">Duplicate</DropdownMenuItem>
                              </>
                            )}

                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
