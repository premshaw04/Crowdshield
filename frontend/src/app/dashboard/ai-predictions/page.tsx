'use client';

import React from 'react';
import { ChartCard } from '@/components/widgets/ChartCard';
import { KeyValueListCard, KeyValueItem } from '@/components/widgets/KeyValueListCard';
import { RecommendationCard, RecommendationItem } from '@/components/widgets/RecommendationCard';
import { ProgressListCard, ProgressItem } from '@/components/widgets/ProgressListCard';
import { GaugeCard } from '@/components/widgets/GaugeCard';
import { DataTableCard, TableColumn } from '@/components/widgets/DataTableCard';
import { Settings2, ChevronDown } from 'lucide-react';

export default function AIPredictionsPage() {
  
  // 1. Risk Trend Chart Data (matches screenshot: 92% Very High Risk, Expected in 6 min)
  const riskData = {
    labels: ['11:30', '11:32', '11:34', '11:36', '11:38', '11:40', '11:42'],
    datasets: [
      {
        fill: true,
        label: 'Risk Score (%)',
        data: [35, 42, 38, 55, 75, 92, 85],
        borderColor: '#ef4444',
        backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
          return gradient;
        },
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  // 2. Contributing Factors (matches screenshot)
  const contributingFactors: KeyValueItem[] = [
    { label: 'Density', value: '9.2', statusText: 'people/m²' },
    { label: 'Inflow Rate', value: '0.08', statusText: 'm/s' },
    { label: 'Temperature', value: '32°C', statusText: '' },
    { label: 'Historical Pattern', value: 'High', statusColor: 'text-red-500' },
  ];

  // 3. Zones at Risk (matches screenshot)
  const zonesAtRisk: ProgressItem[] = [
    { id: 1, label: 'Main Entrance', value: 92, valueText: '92% Very High Risk', colorClass: 'bg-red-500' },
    { id: 2, label: 'Food Court', value: 76, valueText: '76% High Risk', colorClass: 'bg-orange-500' },
    { id: 3, label: 'Fashion Zone', value: 64, valueText: '64% Medium Risk', colorClass: 'bg-yellow-500' },
    { id: 4, label: 'Parking Area', value: 18, valueText: '18% Low Risk', colorClass: 'bg-green-500' },
  ];

  // 4. AI Recommendations
  const aiRecommendations: RecommendationItem[] = [
    { id: 1, title: 'Open Gate 5', desc: 'Reduce density in Food Court', impact: 'High Impact', actionLabel: 'Approve', onAction: () => { import('sonner').then(m => m.toast.info('This is a global overview. Please navigate to a specific Active Event to send real alerts.')); } },
    { id: 2, title: 'Close Gate 2', desc: 'Prevent further crowd inflow', impact: 'Medium Impact', actionLabel: 'Approve', onAction: () => { import('sonner').then(m => m.toast.info('This is a global overview. Please navigate to a specific Active Event to send real alerts.')); } },
    { id: 3, title: 'Deploy 15 Guards', desc: 'At Food Court & Gate 3', impact: 'High Impact', actionLabel: 'Approve', onAction: () => { import('sonner').then(m => m.toast.info('This is a global overview. Please navigate to a specific Active Event to send real alerts.')); } },
  ];

  // 5. Prediction History
  const historyColumns: TableColumn[] = [
    { key: 'time', header: 'Time' },
    { key: 'event', header: 'Predicted Event' },
    { key: 'actual', header: 'Actual Outcome' },
    { key: 'accuracy', header: 'Accuracy', align: 'right' },
  ];
  const historyData = [
    { id: 1, time: '11:00 AM', event: 'Food Court Overcrowding', actual: 'Overcrowded at 11:05 AM', accuracy: '98%' },
    { id: 2, time: '10:30 AM', event: 'Gate 2 Congestion', actual: 'Congested at 10:38 AM', accuracy: '92%' },
    { id: 3, time: '09:15 AM', event: 'Parking Area Full', actual: 'Full at 09:40 AM', accuracy: '85%' },
    { id: 4, time: '08:00 AM', event: 'Morning Rush Peak', actual: 'Peaked at 08:15 AM', accuracy: '95%' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/30 p-4 rounded-lg border border-border/50">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">AI Predictions</h1>
          <p className="text-xs text-muted-foreground mt-1">Real-time machine learning threat assessment</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Prediction Mode:</span>
            <button className="flex items-center gap-2 bg-black/40 border border-white/5 px-3 py-1.5 rounded-md text-xs font-semibold text-foreground hover:bg-white/5 transition-colors">
              Crowd Risk <ChevronDown size={14} className="text-muted-foreground" />
            </button>
          </div>
          <button className="p-2 rounded bg-black/40 border border-white/5 text-muted-foreground hover:text-foreground transition-colors">
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Primary Analytics */}
        <div className="col-span-1 xl:col-span-8 space-y-6">
          
          {/* Main Risk Chart */}
          <div className="min-h-[350px]">
             <ChartCard 
               title="Risk Level Prediction" 
               subtitle="(Next 10 Minutes)" 
               data={riskData} 
               primaryValue="92%" 
               primaryLabel="Very High Risk" 
               secondaryLabel="Expected in" 
               secondaryValue="6 min" 
               valueColor="text-red-500" 
               delay={1} 
             />
          </div>
          
          {/* Progress Bars for Zones */}
          <div className="min-h-[280px]">
             <ProgressListCard title="Zones at Risk" items={zonesAtRisk} delay={3} />
          </div>

          {/* History Table */}
          <div className="min-h-[250px]">
             <DataTableCard title="Prediction History vs Actual" columns={historyColumns} data={historyData} delay={5} />
          </div>

        </div>

        {/* Right Column: Secondary Analytics & Factors */}
        <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
          
          {/* Probability Gauge */}
          <div className="min-h-[220px]">
             <GaugeCard 
               title="Incident Probability" 
               value={87} 
               label="High Probability" 
               sublabel="Next 30 Mins"
               colorClass="text-red-500"
               strokeColor="#ef4444"
               delay={2} 
             />
          </div>

          {/* Contributing Factors */}
          <div className="min-h-[220px]">
             <KeyValueListCard title="Contributing Factors" items={contributingFactors} delay={4} />
          </div>
          
          {/* Recommendations */}
          <div className="flex-1 min-h-[300px]">
             <RecommendationCard recommendations={aiRecommendations} updatedAt="Updated just now" delay={6} />
          </div>

        </div>

      </div>
    </div>
  );
}
