'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trendText?: string;
  trendType?: 'up-good' | 'up-bad' | 'down-bad' | 'down-good' | 'neutral' | 'critical';
  trendLevel?: 'positive' | 'negative' | 'neutral' | 'warning';
  delay?: number;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trendText,
  trendType,
  trendLevel,
  delay = 0,
  icon: Icon,
  iconBg = 'bg-slate-800/60',
  iconColor = 'text-slate-300',
}) => {
  const getTrendClass = () => {
    if (trendType) {
      switch (trendType) {
        case 'up-good':
        case 'down-good':
          return 'text-emerald-400';
        case 'up-bad':
        case 'down-bad':
        case 'critical':
          return 'text-red-400';
        case 'neutral':
        default:
          return 'text-slate-400';
      }
    }
    if (trendLevel) {
      switch (trendLevel) {
        case 'positive':
          return 'text-emerald-400';
        case 'negative':
          return 'text-red-400';
        case 'warning':
          return 'text-amber-400';
        default:
          return 'text-slate-400';
      }
    }
    return 'text-slate-400';
  };


  return (
    <div className="bg-[#111622] border border-[#1a2334] hover:border-[#243249] rounded-xl p-3.5 flex items-start gap-3.5 transition-all shadow-sm">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 border border-white/5`}>
          <Icon size={18} strokeWidth={2.2} />
        </div>
      )}
      
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <span className="text-[11px] text-slate-400 font-medium tracking-wide truncate">
          {title}
        </span>
        
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-xs text-slate-400 font-normal">
              {unit}
            </span>
          )}
        </div>

        {trendText && (
          <span className={`text-[11px] font-medium mt-1 flex items-center gap-1 leading-tight ${getTrendClass()}`}>
            {trendText}
          </span>
        )}
      </div>
    </div>
  );
};

