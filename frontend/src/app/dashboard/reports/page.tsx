'use client';

import React, { useState } from 'react';
import { MetricCard } from '@/components/widgets/MetricCard';
import { ChartCard } from '@/components/widgets/ChartCard';
import { BarChartCard } from '@/components/widgets/BarChartCard';
import { DataTableCard, TableColumn } from '@/components/widgets/DataTableCard';
import { Download, FileText, Filter, Calendar } from 'lucide-react';

export default function ReportsDashboardPage() {
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [zoneFilter, setZoneFilter] = useState('All Zones');

  // Crowd Volume Trend (Line Chart)
  const crowdTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Visitors',
        data: [12000, 19000, 15000, 22000, 28000, 35000, 31000],
        borderColor: '#ef4444', // Deep Dark Red
        backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
          return gradient;
        },
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // Incident Distribution (Bar Chart)
  const incidentData = {
    labels: ['Medical', 'Security', 'Fire', 'Crowd Crush', 'Lost Child', 'Maintenance'],
    datasets: [
      {
        label: 'Incidents',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          '#ef4444', // Red
          '#f97316', // Orange
          '#eab308', // Yellow
          '#ef4444', // Red
          '#8b5cf6', // Purple
          '#3b82f6', // Blue
        ],
        borderRadius: 4,
      },
    ],
  };

  // Incident Reports Table
  const incidentColumns: TableColumn[] = [
    { key: 'id', header: 'Incident ID', width: '10%' },
    { key: 'type', header: 'Type', width: '20%' },
    { key: 'location', header: 'Location', width: '20%' },
    { key: 'reporter', header: 'Reported By', width: '20%' },
    { key: 'time', header: 'Time', width: '15%' },
    { key: 'status', header: 'Status', width: '15%' },
  ];
  
  const incidentReports = [
    { id: 'INC-106', type: 'Medical Emergency', location: 'Food Court', reporter: 'Citizen', time: '11:43 AM', status: 'Active' },
    { id: 'INC-105', type: 'Slip and Fall', location: 'Main Entrance', reporter: 'Citizen', time: '11:28 AM', status: 'Active' },
    { id: 'INC-104', type: 'Fight', location: 'Fashion Zone', reporter: 'Security', time: '11:15 AM', status: 'Active' },
    { id: 'INC-103', type: 'Lost Child', location: 'Parking Area', reporter: 'Citizen', time: '11:00 AM', status: 'Resolved' },
    { id: 'INC-102', type: 'Fire Alarm', location: 'West Wing', reporter: 'System', time: '10:30 AM', status: 'Resolved' },
    { id: 'INC-101', type: 'Crowd Crush', location: 'Gate 2', reporter: 'Security', time: '10:05 AM', status: 'Resolved' },
  ];

  // Crowd Anomalies Table
  const anomalyColumns: TableColumn[] = [
    { key: 'zone', header: 'Zone', width: '25%' },
    { key: 'peakDensity', header: 'Peak Density', width: '25%' },
    { key: 'duration', header: 'Duration', width: '25%' },
    { key: 'time', header: 'Time Logged', width: '25%' },
  ];

  const crowdAnomalies = [
    { id: 1, zone: 'Food Court', peakDensity: '9.2 p/m²', duration: '14 min', time: '11:40 AM' },
    { id: 2, zone: 'Main Entrance', peakDensity: '7.8 p/m²', duration: '8 min', time: '09:15 AM' },
    { id: 3, zone: 'West Wing', peakDensity: '5.5 p/m²', duration: '22 min', time: '08:30 AM' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header Bar & Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-card/30 p-4 rounded-lg border border-border/50 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-muted-foreground mt-1">Generate and analyze historical data</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Filters */}
          <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-md p-1">
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-white/5 rounded transition-colors">
              <Calendar size={14} className="text-muted-foreground" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent outline-none cursor-pointer"
              >
                <option className="bg-black text-white">Today</option>
                <option className="bg-black text-white">Last 7 Days</option>
                <option className="bg-black text-white">This Month</option>
              </select>
            </button>
            <div className="h-4 w-px bg-white/10" />
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-white/5 rounded transition-colors">
              <Filter size={14} className="text-muted-foreground" />
              <select 
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="bg-transparent outline-none cursor-pointer"
              >
                <option className="bg-black text-white">All Zones</option>
                <option className="bg-black text-white">Food Court</option>
                <option className="bg-black text-white">Main Entrance</option>
              </select>
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-md text-xs font-bold transition-all shadow-sm">
              <Download size={14} /> CSV
            </button>
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white border border-primary px-4 py-2 rounded-md text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <FileText size={14} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <MetricCard title="Total Visitors" value="162,000" trendText="↑ 12% vs last period" trendLevel="positive" delay={1} />
        <MetricCard title="Peak Density" value="9.4" unit="p/m²" trendText="Food Court" trendLevel="negative" delay={2} />
        <MetricCard title="Avg Dwell Time" value="45" unit="min" trendText="↑ 5 mins" trendLevel="warning" delay={3} />
        <MetricCard title="Total Incidents" value="44" trendText="↓ 8% vs last period" trendLevel="positive" delay={4} />
      </div>

      {/* Graphical Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-h-[350px]">
          <ChartCard 
            title="Crowd Volume Trend" 
            subtitle={`(${timeRange})`} 
            data={crowdTrendData} 
            primaryValue="35k" 
            primaryLabel="Peak (Sat)" 
            delay={5} 
          />
        </div>
        <div className="min-h-[350px]">
          <BarChartCard 
            title="Incident Distribution" 
            subtitle="By Category" 
            data={incidentData} 
            primaryValue="19" 
            primaryLabel="Security" 
            valueColor="text-orange-500"
            delay={6} 
          />
        </div>
      </div>

      {/* Detailed Logs Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="min-h-[400px]">
          <DataTableCard 
            title="Incident Reports" 
            columns={incidentColumns} 
            data={incidentReports} 
            delay={7} 
          />
        </div>
        <div className="min-h-[400px]">
          <DataTableCard 
            title="Crowd Anomalies" 
            columns={anomalyColumns} 
            data={crowdAnomalies} 
            delay={8} 
          />
        </div>
      </div>

    </div>
  );
}
