import React from 'react';
import { EventStatus } from '@/types/event';
import { Clock, CheckCircle, XCircle, AlertTriangle, PlayCircle, PauseCircle } from 'lucide-react';

export const EventStatusBadge = ({ status }: { status: EventStatus }) => {
  switch (status) {
    case 'LIVE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          LIVE
        </span>
      );
    case 'UPCOMING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 tracking-wider">
          <Clock size={11} />
          UPCOMING
        </span>
      );
    case 'STARTING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 tracking-wider">
          <PlayCircle size={11} />
          STARTING
        </span>
      );
    case 'PAUSED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 tracking-wider">
          <PauseCircle size={11} />
          PAUSED
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium text-emerald-400 bg-slate-500/10 border border-slate-500/20 tracking-wider">
          <CheckCircle size={11} />
          COMPLETED
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium text-red-400 bg-slate-500/10 border border-slate-500/20 tracking-wider">
          <XCircle size={11} />
          CANCELLED
        </span>
      );
    default:
      return null;
  }
};

export const EventRiskBadge = ({ riskLevel }: { riskLevel?: string }) => {
  if (!riskLevel) {
    return <span className="text-slate-500 text-xs">-</span>;
  }

  const isHigh = riskLevel.toUpperCase().includes('HIGH');
  const isCritical = riskLevel.toUpperCase().includes('CRITICAL');
  const isLow = riskLevel.toUpperCase().includes('LOW');

  if (isCritical || isHigh) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20">
        <AlertTriangle size={10} />
        {riskLevel}
      </span>
    );
  }

  if (isLow) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
        {riskLevel}
      </span>
    );
  }

  // Medium or other
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20">
      {riskLevel}
    </span>
  );
};
