'use client';

import React, { useEffect, useState } from 'react';
import { Event as CrowdEvent } from '@/types/event';
import { eventService, AuditLogEntry } from '@/lib/services';
import { Loader2, ShieldCheck, Clock, User, Activity, Target, Search } from 'lucide-react';

interface EventAuditLogTabProps {
  event: CrowdEvent;
}

export const EventAuditLogTab: React.FC<EventAuditLogTabProps> = ({ event }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const data = await eventService.getEventAuditLog(event.id);
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch audit logs', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [event.id]);

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'SUCCESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">SUCCESS</span>;
      case 'FAILED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">FAILED</span>;
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">PENDING</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">{result}</span>;
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Context Bar */}
      <div className="flex items-center justify-between bg-[#111622] border border-[#1a2334] rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <ShieldCheck size={16} className="text-emerald-400" />
            Immutable Audit Log
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span>Event: {event.name}</span>
        </div>
        
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            disabled
            className="pl-8 pr-3 py-1.5 bg-[#0a0d14] border border-[#1a2334] rounded-md text-xs text-white focus:outline-none focus:border-blue-500 cursor-not-allowed opacity-50 w-48"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#111622] border border-[#1a2334] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0d14] border-b border-[#1a2334]">
                <th className="p-4 text-xs font-semibold text-slate-400 whitespace-nowrap">
                  <div className="flex items-center gap-1.5"><Clock size={13} /> Timestamp</div>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-400 whitespace-nowrap">
                  <div className="flex items-center gap-1.5"><User size={13} /> Actor & Role</div>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-400 whitespace-nowrap">
                  <div className="flex items-center gap-1.5"><Activity size={13} /> Action</div>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-400 whitespace-nowrap">
                  <div className="flex items-center gap-1.5"><Target size={13} /> Target</div>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-400 whitespace-nowrap">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2334]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 size={24} className="animate-spin text-slate-400" />
                      <span className="text-sm">Retrieving immutable records...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-sm text-slate-500">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#161d2d]/50 transition-colors group">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-mono text-slate-200">{formatTime(log.timestamp)}</span>
                        <span className="text-[10px] text-slate-500">{formatDate(log.timestamp)}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{log.actor}</span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">{log.role}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-300 font-medium">{log.action}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-400">{log.target}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {getResultBadge(log.result)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        {!isLoading && logs.length > 0 && (
          <div className="p-3 border-t border-[#1a2334] bg-[#0a0d14] flex justify-between items-center text-xs text-slate-500">
            <span>Showing {logs.length} entries</span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              Records cryptographically secured
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
