'use client';

import React from 'react';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';

export const RiskTrendWidget: React.FC = () => {
  // Chart points matching the curve in reference image (rising sharply to 82%)
  const points = [
    { time: '11:12', val: 32, x: 15, y: 85 },
    { time: '11:20', val: 45, x: 75, y: 70 },
    { time: '11:28', val: 58, x: 135, y: 55 },
    { time: '11:36', val: 72, x: 195, y: 35 },
    { time: '11:42', val: 82, x: 255, y: 18 },
  ];

  // SVG curved path
  const pathD = "M 15 85 Q 45 80, 75 70 T 135 55 T 195 35 T 255 18";
  const fillD = "M 15 85 Q 45 80, 75 70 T 135 55 T 195 35 T 255 18 L 255 105 L 15 105 Z";

  return (
    <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-4 flex flex-col justify-between h-full shadow-sm hover:border-[#25334c] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#182130]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs md:text-sm font-bold text-white tracking-wide">
            Risk Trend
          </span>
          <span className="text-xs text-slate-400 font-normal">
            (Last 30 Minutes)
          </span>
        </div>
      </div>

      {/* Body: Chart on Left, Summary Stats on Right */}
      <div className="grid grid-cols-12 gap-2 items-center py-2 flex-1">
        {/* Left: SVG Area Line Chart */}
        <div className="col-span-8 relative h-full min-h-[130px] flex flex-col justify-between">
          <div className="flex items-stretch h-full">
            <div className="flex flex-col justify-between text-[8px] text-slate-500 font-mono select-none pr-1.5 py-1">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            <div className="flex-1 relative flex items-center">
              <svg viewBox="0 0 270 115" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="riskAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#f97316" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="riskLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>

                  <filter id="riskGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Horizontal grid lines */}
                <line x1="5" y1="10" x2="265" y2="10" stroke="#162030" strokeDasharray="3 3" />
                <line x1="5" y1="35" x2="265" y2="35" stroke="#162030" strokeDasharray="3 3" />
                <line x1="5" y1="60" x2="265" y2="60" stroke="#162030" strokeDasharray="3 3" />
                <line x1="5" y1="85" x2="265" y2="85" stroke="#162030" strokeDasharray="3 3" />
                <line x1="5" y1="105" x2="265" y2="105" stroke="#1c283d" />

                {/* Gradient Fill */}
                <path d={fillD} fill="url(#riskAreaGrad)" />

                {/* Line Stroke */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#riskLineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#riskGlow)"
                />

                {/* Data Point Markers */}
                {points.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={i === points.length - 1 ? 4.5 : 3}
                      fill={i === points.length - 1 ? "#ef4444" : "#f97316"}
                      stroke="#111622"
                      strokeWidth="2"
                      className={i === points.length - 1 ? "animate-pulse" : ""}
                    />
                    {i === points.length - 1 && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="8"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.2"
                        opacity="0.6"
                        className="animate-ping-slow"
                      />
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* X Axis Timestamps */}
          <div className="pl-5 flex justify-between text-[8px] text-slate-500 font-mono mt-0.5">
            {points.map((p, i) => (
              <span key={i}>{p.time}</span>
            ))}
          </div>
        </div>


        {/* Right: Summary Stat Callout */}
        <div className="col-span-4 pl-3 border-l border-[#192232] flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-3xl font-black text-red-500 tracking-tight">82%</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-slate-400 font-medium">Current Risk</span>
              <span className="px-1.5 py-0.2 rounded bg-red-950/70 border border-red-700/60 text-red-400 font-bold text-[9px]">
                Critical
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-[#162030]">
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <TrendingUp size={12} />
              <span>↑ 24%</span>
              <span className="text-[10px] text-slate-400 font-normal">vs 10 min ago</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
              <Clock size={12} />
              <span>6 min</span>
              <span className="text-[10px] text-slate-400 font-normal">to critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
