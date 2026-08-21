'use client';

import React from 'react';

export const RecentActionsTimelineWidget: React.FC = () => {
  const actions = [
    {
      id: 1,
      time: '11:42 AM',
      actor: 'Prem Kumar',
      actorRole: 'Authority',
      actionTitle: 'Approved action',
      actionTarget: 'Open Gate 5',
      targetColor: 'text-slate-100 font-semibold',
    },
    {
      id: 2,
      time: '11:41 AM',
      actor: 'AI Engine',
      actorRole: 'System',
      actionTitle: 'Recommended action',
      actionTarget: 'Open Gate 5',
      targetColor: 'text-slate-100 font-semibold',
    },
    {
      id: 3,
      time: '11:40 AM',
      actor: 'System',
      actorRole: 'Alert Engine',
      actionTitle: 'Alert raised',
      actionTarget: 'Food Court High Risk',
      targetColor: 'text-red-400 font-semibold',
    },
    {
      id: 4,
      time: '11:39 AM',
      actor: 'Anita Verma',
      actorRole: 'Security Lead',
      actionTitle: 'Deployed 5 Officers',
      actionTarget: 'To Zone B',
      targetColor: 'text-slate-100 font-semibold',
    },
  ];

  return (
    <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-3.5 flex flex-col justify-between shadow-sm hover:border-[#25334c] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#182130]">
        <span className="text-xs md:text-sm font-bold text-white tracking-wide">
          Recent Actions
        </span>
        <a href="/dashboard/audit-logs" className="text-xs font-semibold text-[#f95738] hover:underline">
          View All
        </a>
      </div>

      {/* Timeline entries */}
      <div className="space-y-2.5 my-2">
        {actions.map((act) => (
          <div key={act.id} className="flex items-start justify-between gap-2 text-xs">
            <div className="flex items-start gap-2 min-w-0">
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 shrink-0">
                {act.time}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-200 truncate">
                  {act.actor}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {act.actionTitle}: <span className={act.targetColor}>{act.actionTarget}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
