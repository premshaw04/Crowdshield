'use client';

import React from 'react';
import { Event as CrowdEvent } from '@/types/event';
import { MetricCard } from '../MetricCard';
import { TopCongestedZonesTable } from '../TopCongestedZonesTable';
import { Users, UserPlus, Activity, TrendingUp, AlertTriangle, Camera, RadioReceiver, Map, LayoutGrid, DoorOpen, Clock } from 'lucide-react';
import { EventRiskBadge } from './EventBadges';

interface EventOverviewTabProps {
  event: CrowdEvent;
}

export const EventOverviewTab: React.FC<EventOverviewTabProps> = ({ event }) => {
  // Use real data where possible, with fallbacks for UI demo purposes if not yet available in telemetry
  const expected = event.expectedVisitors || 0;
  const current = event.currentVisitors || 0;
  
  const onlineCameras = event.cameras?.filter(c => c.status === 'ONLINE').length || 0;
  const totalCameras = event.cameras?.length || 0;
  
  const totalZones = event.zones?.length || 0;
  const totalGates = event.gates?.length || 0;

  // Mock telemetry data if missing
  const avgDensity = 1.8;
  const peakDensity = 3.2;
  const activeAlerts = 0;
  const sensorsOnline = 32;

  // Calculate progress percentage
  const progressPercent = expected > 0 ? Math.min(100, Math.round((current / expected) * 100)) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <MetricCard
          title="Current Visitors"
          value={current.toLocaleString()}
          icon={Users}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
        />
        <MetricCard
          title="Expected Visitors"
          value={expected.toLocaleString()}
          icon={UserPlus}
          iconColor="text-slate-400"
          iconBg="bg-slate-500/10"
        />
        <MetricCard
          title="Avg Density"
          value={avgDensity}
          unit="p/m²"
          icon={Activity}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <MetricCard
          title="Peak Density"
          value={peakDensity}
          unit="p/m²"
          icon={TrendingUp}
          iconColor="text-orange-400"
          iconBg="bg-orange-500/10"
        />
        <MetricCard
          title="Active Alerts"
          value={activeAlerts}
          icon={AlertTriangle}
          iconColor={activeAlerts > 0 ? "text-amber-400" : "text-emerald-400"}
          iconBg={activeAlerts > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Progress & Venue Summary */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Progress / Status Summary */}
          <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              Event Progress
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Visitor Attendance</span>
                <span className="text-white font-medium">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#182130] rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 pt-1">
                <span>0</span>
                <span>{expected.toLocaleString()} Expected</span>
              </div>
            </div>
          </div>

          {/* Infrastructure / Venue Summary */}
          <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Map size={16} className="text-slate-400" />
              Venue Infrastructure
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 border border-[#1a2334] rounded-lg bg-[#0c1018] text-center">
                <LayoutGrid size={20} className="text-blue-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{totalZones}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Zones</div>
              </div>
              
              <div className="p-4 border border-[#1a2334] rounded-lg bg-[#0c1018] text-center">
                <DoorOpen size={20} className="text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{totalGates}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Gates</div>
              </div>

              <div className="p-4 border border-[#1a2334] rounded-lg bg-[#0c1018] text-center">
                <Camera size={20} className="text-emerald-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{onlineCameras}/{totalCameras}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Cameras</div>
              </div>

              <div className="p-4 border border-[#1a2334] rounded-lg bg-[#0c1018] text-center">
                <RadioReceiver size={20} className="text-emerald-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{sensorsOnline}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Sensors</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Risk & Zones */}
        <div className="space-y-6">
          
          {/* Current Risk Summary */}
          <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Risk Level</h3>
            <div className="my-2">
              <EventRiskBadge riskLevel={event.riskLevel || 'LOW'} />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {event.riskLevel?.includes('HIGH') 
                ? 'Heightened crowd density detected. Monitoring advised.' 
                : 'Crowd conditions are within safe operational parameters.'}
            </p>
          </div>

          {/* Top Congested Zones Component */}
          <TopCongestedZonesTable />

        </div>
      </div>
    </div>
  );
};
