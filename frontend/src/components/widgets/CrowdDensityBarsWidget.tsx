'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ZoneDensity {
  name: string;
  density: number;
  maxDensity: number;
  level: 'High' | 'Medium' | 'Low';
  barColor: string;
  badgeBg: string;
  badgeText: string;
}

export const CrowdDensityBarsWidget: React.FC = () => {
  const zones: ZoneDensity[] = [
    {
      name: 'Zone B (Food Court)',
      density: 8.7,
      maxDensity: 10,
      level: 'High',
      barColor: 'bg-red-500',
      badgeBg: 'bg-red-950/70 border-red-800/60',
      badgeText: 'text-red-400',
    },
    {
      name: 'Zone C (Main Atrium)',
      density: 6.1,
      maxDensity: 10,
      level: 'Medium',
      barColor: 'bg-orange-500',
      badgeBg: 'bg-orange-950/70 border-orange-800/60',
      badgeText: 'text-orange-400',
    },
    {
      name: 'Zone E (Parking Area)',
      density: 4.2,
      maxDensity: 10,
      level: 'Medium',
      barColor: 'bg-amber-500',
      badgeBg: 'bg-amber-950/70 border-amber-800/60',
      badgeText: 'text-amber-400',
    },
    {
      name: 'Zone A (West Wing)',
      density: 2.3,
      maxDensity: 10,
      level: 'Low',
      barColor: 'bg-emerald-500',
      badgeBg: 'bg-emerald-950/70 border-emerald-800/60',
      badgeText: 'text-emerald-400',
    },
    {
      name: 'Zone D (East Wing)',
      density: 1.8,
      maxDensity: 10,
      level: 'Low',
      barColor: 'bg-emerald-500',
      badgeBg: 'bg-emerald-950/70 border-emerald-800/60',
      badgeText: 'text-emerald-400',
    },
    {
      name: 'Zone F (Balcony)',
      density: 1.2,
      maxDensity: 10,
      level: 'Low',
      barColor: 'bg-emerald-500',
      badgeBg: 'bg-emerald-950/70 border-emerald-800/60',
      badgeText: 'text-emerald-400',
    },
  ];

  return (
    <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-4 flex flex-col justify-between h-full shadow-sm hover:border-[#25334c] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#182130]">
        <span className="text-xs md:text-sm font-bold text-white tracking-wide">
          Crowd Density by Zone
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          People/m²
        </span>
      </div>

      {/* Progress Bars List */}
      <div className="space-y-2 my-2">
        {zones.map((zone, idx) => {
          const percent = (zone.density / zone.maxDensity) * 100;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-slate-300">
                  {zone.name}
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono">
                    {zone.density}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${zone.badgeBg} ${zone.badgeText}`}>
                    {zone.level}
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full h-1.5 rounded-full bg-[#182234] overflow-hidden">
                <div
                  className={`h-full rounded-full ${zone.barColor} transition-all duration-500`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#182130] text-center">
        <a
          href="/dashboard/heatmap"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f95738] hover:text-orange-400 transition-colors"
        >
          View All Zones
          <ArrowRight size={13} />
        </a>
      </div>
    </div>
  );
};
