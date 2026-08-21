'use client';

import React from 'react';

export const SystemStatusNodesWidget: React.FC = () => {
  const nodes = [
    { name: 'AI Engine', status: 'Operational' },
    { name: 'CCTV Processing', status: 'Operational' },
    { name: 'IoT Gateway', status: 'Operational' },
    { name: 'Database', status: 'Operational' },
    { name: 'WebSocket', status: 'Operational' },
    { name: 'Notifications', status: 'Operational' },
  ];

  return (
    <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-3.5 flex flex-col justify-between shadow-sm hover:border-[#25334c] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#182130]">
        <span className="text-xs md:text-sm font-bold text-white tracking-wide">
          System Status
        </span>
      </div>

      {/* Nodes List */}
      <div className="space-y-1.5 my-2">
        {nodes.map((node, i) => (
          <div key={i} className="flex items-center justify-between py-0.5 text-xs">
            <span className="text-[11px] text-slate-300 font-medium">{node.name}</span>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {node.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
