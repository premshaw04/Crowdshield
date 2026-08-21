'use client';

import React from 'react';

interface DonutProps {
  label: string;
  percentage: number;
  color: string;
  strokeClass: string;
}

const DonutGauge: React.FC<DonutProps> = ({ label, percentage, color, strokeClass }) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          {/* Background circle track */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="#172233"
            strokeWidth="5"
          />
          {/* Foreground progress circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white font-mono">{percentage}%</span>
        </div>
      </div>

      <span className="text-[10px] text-slate-400 font-semibold mt-1.5 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

export const SystemResourcesDonutWidget: React.FC = () => {
  return (
    <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-3.5 flex flex-col justify-between shadow-sm hover:border-[#25334c] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#182130]">
        <span className="text-xs md:text-sm font-bold text-white tracking-wide">
          System Resources
        </span>
      </div>

      {/* 3 Donut Gauges */}
      <div className="grid grid-cols-3 gap-2 py-3">
        <DonutGauge label="CPU" percentage={42} color="#10b981" strokeClass="text-emerald-500" />
        <DonutGauge label="GPU" percentage={68} color="#f97316" strokeClass="text-orange-500" />
        <DonutGauge label="Memory" percentage={56} color="#38bdf8" strokeClass="text-sky-400" />
      </div>
    </div>
  );
};
