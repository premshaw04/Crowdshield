'use client';

import React from 'react';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

export const TopCongestedZonesTable: React.FC = () => {
  const rows = [
    {
      rank: 1,
      name: 'Zone B (Food Court)',
      density: '8.7',
      trend: '↑ 22%',
      trendUp: true,
      trendCritical: true,
      risk: 'High',
      riskColor: 'bg-red-950/70 border-red-800/60 text-red-400',
    },
    {
      rank: 2,
      name: 'Zone C (Main Atrium)',
      density: '6.1',
      trend: '↑ 12%',
      trendUp: true,
      trendCritical: false,
      risk: 'Medium',
      riskColor: 'bg-orange-950/70 border-orange-800/60 text-orange-400',
    },
    {
      rank: 3,
      name: 'Zone E (Parking Area)',
      density: '4.2',
      trend: '↓ 5%',
      trendUp: false,
      trendCritical: false,
      risk: 'Medium',
      riskColor: 'bg-orange-950/70 border-orange-800/60 text-orange-400',
    },
    {
      rank: 4,
      name: 'Zone A (West Wing)',
      density: '2.3',
      trend: '↑ 8%',
      trendUp: true,
      trendCritical: false,
      risk: 'Low',
      riskColor: 'bg-emerald-950/70 border-emerald-800/60 text-emerald-400',
    },
  ];

  return (
    <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-4 flex flex-col justify-between h-full shadow-sm hover:border-[#25334c] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#182130]">
        <span className="text-xs md:text-sm font-bold text-white tracking-wide">
          Top Congested Zones
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto my-2">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] uppercase text-slate-500 border-b border-[#162030]">
              <th className="pb-1.5 font-semibold">Zone</th>
              <th className="pb-1.5 font-semibold">Density</th>
              <th className="pb-1.5 font-semibold">Trend</th>
              <th className="pb-1.5 font-semibold text-right">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151e2c]">
            {rows.map((row) => (
              <tr key={row.rank} className="hover:bg-[#151c2a] transition-colors">
                <td className="py-2 flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">{row.rank}</span>
                  <span className="font-medium text-slate-200 text-[11px] truncate max-w-[120px] sm:max-w-none">
                    {row.name}
                  </span>
                </td>
                
                <td className="py-2 text-[11px] font-bold text-white font-mono">
                  {row.density} <span className="text-[9px] text-slate-500 font-normal">/m²</span>
                </td>

                <td className="py-2">
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                    row.trendCritical ? 'text-red-400' : row.trendUp ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {row.trend}
                  </span>
                </td>

                <td className="py-2 text-right">
                  <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${row.riskColor}`}>
                    {row.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
