'use client';

import React from 'react';
import { incidentsApi, Incident } from '@/lib/services';
import { useApiState } from '@/hooks/useApiState';
import { ApiStateBoundary } from '@/components/ui/ApiStateBoundary';

export const ActiveIncidentsWidget: React.FC = () => {
  const { data: incidents, isLoading, error, isEmpty, isOffline, retry } = useApiState<Incident[]>(
    async () => {
      const data = await incidentsApi.getIncidents();
      return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
    },
    { executeOnMount: true }
  );

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLevelClass = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-950/80 border-red-700 text-red-400';
      case 'HIGH': return 'bg-orange-950/80 border-orange-700 text-orange-400';
      case 'MEDIUM': return 'bg-amber-950/80 border-amber-700 text-amber-400';
      default: return 'bg-blue-950/80 border-blue-700 text-blue-400';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-emerald-950/80 border-emerald-700/60 text-emerald-400';
      case 'INVESTIGATING': return 'bg-amber-950/80 border-amber-700/60 text-amber-400';
      default: return 'bg-blue-950/80 border-blue-700/60 text-blue-400';
    }
  };

  return (
    <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-4 flex flex-col justify-between h-full shadow-sm hover:border-[#25334c] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#182130]">
        <span className="text-xs md:text-sm font-bold text-white tracking-wide">
          Active Incidents
        </span>
        <a href="/dashboard/incident-management" className="text-xs font-semibold text-[#f95738] hover:underline">
          View All
        </a>
      </div>

      {/* Incident List */}
      <div className="space-y-1.5 my-2 flex-grow min-h-[150px]">
        <ApiStateBoundary
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          isOffline={isOffline}
          onRetry={retry}
          loadingMessage="Fetching active incidents..."
          emptyMessage="No active incidents."
        >
          {incidents?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-[#0e131d]/60 border border-[#161f2e] hover:border-[#223048] transition-all"
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className={`px-1 py-0.2 rounded border text-[8px] font-black uppercase tracking-tight shrink-0 ${getLevelClass(item.severity)}`}>
                  {item.severity}
                </span>

                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-slate-100 truncate leading-tight">
                    {item.title}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate">
                    {item.location}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] text-slate-400 font-mono">
                  {formatTime(item.createdAt)}
                </span>
                <span className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold ${getStatusClass(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </ApiStateBoundary>
      </div>

      {/* 4 Summary Stats Footer */}
      <div className="grid grid-cols-4 divide-x divide-[#182232] pt-2 border-t border-[#182130] text-center bg-[#0d121c]/40 rounded-lg p-1.5 mt-1">
        <div className="px-1">
          <span className="text-[9px] text-slate-400 uppercase tracking-tight block">Total</span>
          <span className="text-xs font-bold text-white font-mono">8</span>
        </div>
        <div className="px-1">
          <span className="text-[9px] text-slate-400 uppercase tracking-tight block">Active</span>
          <span className="text-xs font-bold text-red-400 font-mono">3</span>
        </div>
        <div className="px-1">
          <span className="text-[9px] text-slate-400 uppercase tracking-tight block">Resolved</span>
          <span className="text-xs font-bold text-emerald-400 font-mono">5</span>
        </div>
        <div className="px-1">
          <span className="text-[9px] text-slate-400 uppercase tracking-tight block">Avg Time</span>
          <span className="text-xs font-bold text-amber-400 font-mono">2m 14s</span>
        </div>
      </div>
    </div>
  );
};
