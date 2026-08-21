'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Event as CrowdEvent } from '@/types/event';
import { eventService } from '@/lib/services';
import { MetricCard } from '@/components/widgets/MetricCard';
import { ChartCard } from '@/components/widgets/ChartCard';
import { BarChartCard } from '@/components/widgets/BarChartCard';
import { ArrowLeft, Download, Loader2, Users, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import Link from 'next/link';
import { ChartData } from 'chart.js';

export default function EventReportPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;

  const [event, setEvent] = useState<CrowdEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (eventId) {
          const data = await eventService.getEventById(eventId);
          setEvent(data || null);
        }
      } catch (err) {
        console.error('Failed to load event:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-slate-500" size={32} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <h2 className="text-xl font-bold text-white mb-2">Event Not Found</h2>
        <button onClick={() => router.push('/dashboard/events')} className="text-blue-500 hover:underline">
          Return to Events
        </button>
      </div>
    );
  }

  // --- Mock Data for Charts ---

  const visitorFlowData: ChartData<'line'> = {
    labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    datasets: [{
      label: 'Visitor Flow',
      data: [1200, 3500, 7800, 12500, 11000, 8500, 6200, 3100],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const densityData: ChartData<'line'> = {
    labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    datasets: [{
      label: 'Avg Density (ppl/m²)',
      data: [1.2, 2.5, 4.1, 5.8, 5.2, 3.9, 2.8, 1.5],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const riskData: ChartData<'line'> = {
    labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    datasets: [{
      label: 'Risk Score',
      data: [15, 28, 65, 88, 75, 45, 30, 12],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const alertVolumeData = {
    labels: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'],
    datasets: [{
      label: 'Total Alerts',
      data: [12, 45, 8, 22, 5],
      backgroundColor: '#f97316',
      borderRadius: 4,
    }],
  };

  const zoneUtilData = {
    labels: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'],
    datasets: [{
      label: 'Peak Utilization %',
      data: [45, 95, 35, 75, 20],
      backgroundColor: '#10b981',
      borderRadius: 4,
    }],
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] text-slate-300 p-6 space-y-6 overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href={`/dashboard/events/${eventId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-2">
            <ArrowLeft size={14} /> Back to Event
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {event.name} <span className="text-slate-500 font-normal">| Post-Event Report</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generated automatically upon event completion. Data is immutable.
          </p>
        </div>
        
        <button disabled className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111622] border border-[#1a2334] text-slate-500 font-medium cursor-not-allowed group relative">
          <Download size={16} />
          Export Report
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity text-center pointer-events-none">
            PDF Export Coming Soon
          </div>
        </button>
      </div>

      {/* Metrics Section */}
      <div className="space-y-6">
        
        {/* Category: Visitor Metrics */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users size={16} /> Visitor & Crowd Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Visitors" 
              value="42,500" 
              trendText="Total cumulative entries" 
              icon={Users} 
              iconColor="text-blue-400" 
              iconBg="bg-blue-500/10" 
            />
            <MetricCard 
              title="Peak Visitors" 
              value="12,500" 
              trendText="At 13:00 hours" 
            />
            <MetricCard 
              title="Peak Density" 
              value="5.8" 
              unit="ppl/m²"
              trendText="Zone B (Food Court)"
              trendLevel="negative"
            />
            <MetricCard 
              title="Peak Risk Score" 
              value="88" 
              unit="/100"
              trendText="Critical status reached" 
              trendLevel="negative"
            />
          </div>
        </div>

        {/* Category: Incident & Safety Metrics */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck size={16} /> Safety & Incidents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Alerts" 
              value="92" 
              trendText="Across all zones" 
              icon={AlertTriangle} 
              iconColor="text-amber-400" 
              iconBg="bg-amber-500/10" 
            />
            <MetricCard 
              title="Critical Alerts" 
              value="14" 
              trendText="Requiring intervention" 
              trendLevel="negative"
            />
            <MetricCard 
              title="Total Incidents" 
              value="3" 
              trendText="Logged by staff" 
            />
            <MetricCard 
              title="Resolved Incidents" 
              value="3" 
              trendText="100% Resolution Rate" 
              trendLevel="positive"
            />
          </div>
        </div>

        {/* Category: AI & Operations */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Cpu size={16} /> AI & Operations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard 
              title="Average Response Time" 
              value="2.4" 
              unit="mins"
              trendText="Incident acknowledgment" 
              trendLevel="positive"
            />
            <MetricCard 
              title="AI Recommendations" 
              value="45" 
              trendText="Generated during event" 
              icon={Cpu} 
              iconColor="text-purple-400" 
              iconBg="bg-purple-500/10" 
            />
            <MetricCard 
              title="Approved Actions" 
              value="18" 
              trendText="Authority executions" 
            />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Event Telemetry Visualization</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="h-[300px]">
            <ChartCard title="Visitor Flow Over Time" data={visitorFlowData} />
          </div>
          <div className="h-[300px]">
            <ChartCard title="Average Density Over Time" data={densityData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-[280px]">
            <ChartCard title="AI Risk Score Over Time" data={riskData} />
          </div>
          <div className="h-[280px]">
            <BarChartCard title="Alert Volume by Zone" data={alertVolumeData} />
          </div>
          <div className="h-[280px]">
            <BarChartCard title="Peak Zone Utilization" data={zoneUtilData} />
          </div>
        </div>
      </div>

    </div>
  );
}
