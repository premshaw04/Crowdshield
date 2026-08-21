'use client';

import React, { useState, useEffect } from 'react';
import { MoreVertical, Check, ArrowRight, Loader2, Info } from 'lucide-react';
import { recommendationsApi, AIRecommendation } from '@/lib/services';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { toast } from 'sonner';

interface AIRecommendationsCardProps {
  eventId?: string;
}

const STATIC_FALLBACK_ITEMS = [
  {
    id: 'static_1',
    eventId: 'none',
    type: 'GATE_CONTROL',
    target: 'Gate 5',
    reason: 'Static fallback data',
    confidence: 94,
    expectedEffect: 'Reduce density in Zone B',
    status: 'PENDING' as const,
    isHighUrgency: true,
  },
  {
    id: 'static_2',
    eventId: 'none',
    type: 'GATE_CONTROL',
    target: 'Gate 2',
    reason: 'Static fallback data',
    confidence: 91,
    expectedEffect: 'Stop incoming crowd',
    status: 'PENDING' as const,
  },
  {
    id: 'static_3',
    eventId: 'none',
    type: 'PERSONNEL_DEPLOYMENT',
    target: 'Zone B & Food Court',
    reason: 'Static fallback data',
    confidence: 87,
    expectedEffect: 'Deploy 8 Security Officers',
    status: 'PENDING' as const,
  },
  {
    id: 'static_4',
    eventId: 'none',
    type: 'SYSTEM_BROADCAST',
    target: 'West Wing Exits',
    reason: 'Static fallback data',
    confidence: 89,
    expectedEffect: 'Broadcast Diversion Alert',
    status: 'PENDING' as const,
  },
];

export const AIRecommendationsCard: React.FC<AIRecommendationsCardProps> = ({ eventId }) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog state
  const [dialogConfig, setDialogConfig] = useState<{ isOpen: boolean; rec: AIRecommendation | null }>({ isOpen: false, rec: null });
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecs = async () => {
      setIsLoading(true);
      try {
        if (eventId) {
          const data = await recommendationsApi.getEventRecommendations(eventId);
          setRecommendations(data);
        } else {
          // Global dashboard fallback
          setRecommendations(STATIC_FALLBACK_ITEMS);
        }
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecs();
  }, [eventId]);

  const handleActionClick = (rec: AIRecommendation) => {
    setDialogConfig({ isOpen: true, rec });
  };

  const executeAction = async () => {
    const rec = dialogConfig.rec;
    if (!rec || !eventId) {
      setDialogConfig({ isOpen: false, rec: null });
      return;
    }

    setIsProcessingId(rec.id);
    
    try {
      if (rec.status === 'PENDING') {
        // Step 1: Approve
        const updated = await recommendationsApi.approveRecommendation(eventId, rec.id);
        setRecommendations(prev => prev.map(r => r.id === rec.id ? updated : r));
      } else if (rec.status === 'APPROVED') {
        // Step 2: Execute
        // Optimistic UI for EXECUTING
        setRecommendations(prev => prev.map(r => r.id === rec.id ? { ...r, status: 'EXECUTING' } : r));
        const executed = await recommendationsApi.executeRecommendation(eventId, rec.id);
        setRecommendations(prev => prev.map(r => r.id === rec.id ? executed : r));
      }
      
      setDialogConfig({ isOpen: false, rec: null });
      setIsProcessingId(null);
    } catch (error) {
      console.error('Failed to process recommendation action', error);
      setIsProcessingId(null);
      // Revert executing state if it fails
      setRecommendations(prev => prev.map(r => r.id === rec.id ? { ...r, status: rec.status } : r));
    }
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={dialogConfig.isOpen}
        title={dialogConfig.rec?.status === 'APPROVED' ? `Execute: ${dialogConfig.rec?.expectedEffect}` : `Approve: ${dialogConfig.rec?.expectedEffect || 'Action'}`}
        message={dialogConfig.rec?.status === 'APPROVED' ? `Are you sure you want to execute this approved action targeting ${dialogConfig.rec?.target}?` : `Are you sure you want to approve this recommendation targeting ${dialogConfig.rec?.target}? Reason: ${dialogConfig.rec?.reason}`}
        confirmText={dialogConfig.rec?.status === 'APPROVED' ? "Execute Action" : "Approve Action"}
        intent="primary"
        isProcessing={isProcessingId === dialogConfig.rec?.id}
        onConfirm={executeAction}
        onCancel={() => setDialogConfig({ isOpen: false, rec: null })}
      />

      <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-4 flex flex-col justify-between h-full shadow-sm hover:border-[#25334c] transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#182130]">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-bold text-white tracking-wide">
              AI Recommendations
            </span>
            {eventId && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-900/40 text-purple-400 text-[9px] font-bold tracking-wider uppercase">
                <Info size={10} />
                DEMO
              </span>
            )}
          </div>
          <button aria-label="Options" className="text-slate-400 hover:text-white transition-colors">
            <MoreVertical size={15} />
          </button>
        </div>

        {/* Recommendations List */}
        <div className="space-y-2 my-2 min-h-[160px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-slate-500">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="flex justify-center items-center h-full text-sm text-slate-500">
              No recommendations at this time.
            </div>
          ) : (
            recommendations.map((item, idx) => {
              const isApproved = item.status === 'APPROVED' || item.status === 'EXECUTING' || item.status === 'COMPLETED';
              const isExecuting = item.status === 'EXECUTING';
              const isCompleted = item.status === 'COMPLETED';

              return (
                <div
                  key={item.id}
                  className="group flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-[#0e131d]/60 border border-[#161f2e] hover:border-[#223048] transition-all relative overflow-hidden"
                >
                  {/* Hover reason reveal */}
                  {item.reason && (
                    <div className="absolute inset-0 bg-[#141c2b]/95 backdrop-blur-sm p-2 text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center z-10 pointer-events-none">
                      {item.reason}
                    </div>
                  )}

                  <div className="flex items-center gap-2 min-w-0 flex-1 relative z-0">
                    {/* Number Badge */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                        item.isHighUrgency
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold text-white truncate leading-tight">
                        {item.expectedEffect}
                      </span>
                      <span className="text-[9px] text-slate-400 truncate">
                        {item.target}
                      </span>
                    </div>
                  </div>

                  {/* Confidence & Action */}
                  <div className="flex items-center gap-1.5 shrink-0 relative z-20">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-slate-400 font-medium leading-none">
                        Confidence
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 font-mono mt-0.5">
                        {item.confidence}%
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (!eventId) {
                          toast.success('Action simulated on global dashboard.');
                          setRecommendations(prev => prev.filter(r => r.id !== item.id));
                        } else {
                          handleActionClick(item);
                        }
                      }}
                      disabled={isCompleted || isExecuting}
                      className={`min-w-[70px] flex justify-center px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                        isExecuting
                          ? 'bg-blue-950/80 border-blue-700 text-blue-400 cursor-default'
                          : isCompleted
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400 cursor-default'
                          : 'bg-[#141c2b] border-[#253248] text-slate-200 hover:bg-[#d94828] hover:border-[#d94828] hover:text-white'
                      }`}
                      title={!eventId ? "Simulated action" : ""}
                    >
                      {isExecuting ? (
                        <>
                          <Loader2 size={11} className="animate-spin mr-1 mt-0.5" />
                          Executing
                        </>
                      ) : isCompleted ? (
                        <>
                          <Check size={11} className="mr-1 mt-0.5" />
                          Completed
                        </>
                      ) : item.status === 'APPROVED' ? (
                        'Execute'
                      ) : (
                        'Approve'
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Link */}
        <div className="pt-2 border-t border-[#182130] text-center">
          <a
            href={eventId ? `/dashboard/events/${eventId}/report` : "/dashboard/ai-predictions"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f95738] hover:text-orange-400 transition-colors"
          >
            {eventId ? 'View AI Analytics' : 'View Full Recommendation Plan'}
            <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </>
  );
};
