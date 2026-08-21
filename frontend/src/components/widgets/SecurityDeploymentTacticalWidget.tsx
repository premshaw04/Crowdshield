'use client';

import React from 'react';
import { ArrowRight, Shield } from 'lucide-react';

export const SecurityDeploymentTacticalWidget: React.FC = () => {
  const stats = [
    { label: 'Available', count: 42, pct: '41%', dotColor: 'bg-blue-400', textColor: 'text-blue-400' },
    { label: 'Deployed', count: 31, pct: '30%', dotColor: 'bg-orange-400', textColor: 'text-orange-400' },
    { label: 'On Route', count: 11, pct: '11%', dotColor: 'bg-emerald-400', textColor: 'text-emerald-400' },
    { label: 'Emergency', count: 8, pct: '8%', dotColor: 'bg-red-400', textColor: 'text-red-400' },
  ];

  return (
    <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-4 flex flex-col justify-between h-full shadow-sm hover:border-[#25334c] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#182130]">
        <span className="text-xs md:text-sm font-bold text-white tracking-wide">
          Security Deployment Overview
        </span>
      </div>

      {/* Blueprint Visualizer + Right Stats */}
      <div className="grid grid-cols-12 gap-2 items-center py-2 flex-1">
        {/* Left 7 cols: Tactical Blueprint Map */}
        <div className="col-span-7 relative h-full min-h-[115px] bg-[#090d15] rounded-lg border border-[#162030] overflow-hidden flex items-center justify-center p-1">
          <svg viewBox="0 0 200 120" className="w-full h-full object-contain">
            {/* Dark Mall Grid */}
            <defs>
              <pattern id="tacGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#121a28" strokeWidth="0.5" />
              </pattern>
            </defs>

            <rect width="200" height="120" fill="url(#tacGrid)" />

            {/* Architectural Outline */}
            <rect x="15" y="15" width="170" height="90" rx="8" fill="#0d1422" stroke="#1f2c42" strokeWidth="1" />
            <line x1="15" y1="60" x2="185" y2="60" stroke="#1a253a" strokeDasharray="2 2" />
            <line x1="90" y1="15" x2="90" y2="105" stroke="#1a253a" strokeDasharray="2 2" />

            {/* Hot zone orange glow in center */}
            <circle cx="120" cy="55" r="22" fill="#f97316" opacity="0.15" />
            <circle cx="120" cy="55" r="14" fill="#ef4444" opacity="0.25" />

            {/* Tactical Guard Nodes */}
            {/* Orange Deployed node */}
            <g transform="translate(115, 50)">
              <circle cx="5" cy="5" r="8" fill="#f97316" opacity="0.3" className="animate-ping-slow" />
              <circle cx="5" cy="5" r="5" fill="#f97316" stroke="#fff" strokeWidth="1" />
            </g>

            {/* Red Emergency node */}
            <g transform="translate(135, 65)">
              <circle cx="5" cy="5" r="7" fill="#ef4444" opacity="0.4" className="animate-ping-slow" />
              <circle cx="5" cy="5" r="4.5" fill="#ef4444" stroke="#fff" strokeWidth="1" />
            </g>

            {/* Blue Available nodes around perimeter */}
            <circle cx="45" cy="35" r="4" fill="#38bdf8" stroke="#fff" strokeWidth="0.8" />
            <circle cx="40" cy="85" r="4" fill="#38bdf8" stroke="#fff" strokeWidth="0.8" />
            <circle cx="160" cy="35" r="4" fill="#38bdf8" stroke="#fff" strokeWidth="0.8" />
            <circle cx="165" cy="85" r="4" fill="#38bdf8" stroke="#fff" strokeWidth="0.8" />

            {/* Green On Route node */}
            <circle cx="90" cy="80" r="4" fill="#10b981" stroke="#fff" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Right 5 cols: Legend & Status Breakdown */}
        <div className="col-span-5 flex flex-col justify-between space-y-1 pl-1">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full ${s.dotColor} shrink-0`} />
                <span className="text-[10px] text-slate-300 font-medium truncate">{s.label}</span>
              </div>
              <div className="flex items-baseline gap-0.5 shrink-0">
                <span className={`text-[11px] font-bold font-mono ${s.textColor}`}>{s.count}</span>
                <span className="text-[8px] text-slate-500">({s.pct})</span>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Footer */}
      <div className="pt-2 border-t border-[#182130] text-center">
        <a
          href="/dashboard/security-deployment"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f95738] hover:text-orange-400 transition-colors"
        >
          View Deployment Map
          <ArrowRight size={13} />
        </a>
      </div>
    </div>
  );
};
