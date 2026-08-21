'use client';

import React, { useEffect, useState } from 'react';
import { Event as CrowdEvent } from '@/types/event';
import { predictionsApi, AIPrediction } from '@/lib/services';
import { ShieldAlert, Activity, Clock, Target, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { AIRecommendationsCard } from '@/components/widgets/AIRecommendationsCard';

interface EventSafetyTabProps {
  event: CrowdEvent;
}

export const EventSafetyTab: React.FC<EventSafetyTabProps> = ({ event }) => {
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchPrediction = async () => {
      setIsRefreshing(true);
      try {
        const data = await predictionsApi.getCurrentPrediction(event.id);
        setPrediction(data);
      } catch (error) {
        console.error('Failed to fetch prediction', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    // Initial fetch
    if (event.status === 'LIVE' || event.status === 'PAUSED') {
      fetchPrediction();
      
      // Setup interval for live updates
      const interval = setInterval(fetchPrediction, 10000); // 10 seconds for demo
      return () => clearInterval(interval);
    }
  }, [event.id, event.status, event.safetyThresholds]);

  if (event.status !== 'LIVE' && event.status !== 'PAUSED') {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-slate-400 bg-[#111622] border border-[#1a2334] rounded-xl shadow-sm">
        <ShieldAlert size={48} className="mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-white mb-2">AI Analysis Offline</h3>
        <p className="max-w-md text-center text-sm">
          Event is currently <strong>{event.status}</strong>. AI predictions and safety monitoring will activate once the event is LIVE.
        </p>
      </div>
    );
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'LOW': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Context Bar */}
      <div className="flex items-center justify-between bg-[#111622] border border-[#1a2334] rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <ShieldAlert size={16} className="text-blue-400" />
            Safety & Predictions
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span>Event: {event.name}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {isRefreshing && <Loader2 size={14} className="animate-spin text-slate-400" />}
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-950/40 border border-purple-900/40 text-purple-400 text-[10px] font-bold tracking-wider uppercase">
            <Info size={12} />
            DEMO MODE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Configured Thresholds */}
        <div className="col-span-1 space-y-4">
          <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Target size={16} className="text-slate-400" />
              Event Safety Thresholds
            </h3>
            
            <div className="space-y-4">
              {event.safetyThresholds && Object.entries(event.safetyThresholds).map(([key, value]) => {
                // Formatting keys like "warningDensity" to "Warning Density"
                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                
                let unit = '';
                if (key.includes('Density')) unit = ' ppl/m²';
                else if (key.includes('Speed')) unit = ' m/s';
                else if (key.includes('Occupancy')) unit = '%';
                else if (key.includes('Rate')) unit = ' ppl/hr';
                else if (key.includes('Horizon')) unit = ' mins';

                return (
                  <div key={key} className="flex justify-between items-center border-b border-[#1a2334] pb-2 last:border-0 last:pb-0">
                    <span className="text-xs text-slate-400">{formattedKey}</span>
                    <span className="text-sm font-semibold text-slate-200">{value}{unit}</span>
                  </div>
                );
              })}
              {!event.safetyThresholds && (
                <div className="text-sm text-slate-500">No custom thresholds configured.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Predictions */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-5 h-full">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <Activity size={16} className="text-slate-400" />
              AI Risk Forecast
            </h3>

            {!prediction ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 size={24} className="animate-spin text-slate-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Score Dial */}
                <div className="flex flex-col items-center justify-center p-6 bg-[#0a0d14] rounded-xl border border-[#1a2334]">
                  <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#1a2334" strokeWidth="8" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        strokeDasharray="282.7" 
                        strokeDashoffset={282.7 - (282.7 * prediction.riskScore) / 100}
                        className={
                          prediction.severity === 'CRITICAL' ? 'text-red-500' :
                          prediction.severity === 'HIGH' ? 'text-orange-500' :
                          prediction.severity === 'MEDIUM' ? 'text-amber-500' :
                          'text-emerald-500'
                        }
                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-black text-white">{prediction.riskScore}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Score</span>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(prediction.severity)}`}>
                    {prediction.severity} RISK
                  </span>
                </div>

                {/* Details & Factors */}
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                        <Clock size={12} /> Horizon
                      </span>
                      <span className="text-xl font-bold text-slate-200">+{prediction.predictionHorizonMins} mins</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                        <Target size={12} /> Confidence
                      </span>
                      <span className="text-xl font-bold text-slate-200">{prediction.confidence}%</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1">
                      <AlertTriangle size={12} /> Contributing Factors
                    </span>
                    <ul className="space-y-2">
                      {prediction.contributingFactors.map((factor: string, idx: number) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2 bg-[#0a0d14] p-2.5 rounded-lg border border-[#1a2334]">
                          <span className="text-red-400 mt-0.5">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            )}
          </div>
          
          {/* AI Recommendations Module */}
          <div className="mt-4 h-[250px]">
            <AIRecommendationsCard eventId={event.id} />
          </div>
        </div>

      </div>
    </div>
  );
};
