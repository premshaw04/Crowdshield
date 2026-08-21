'use client';

import React from 'react';
import { Users, Layers, Activity, Bell, Camera, Radio } from 'lucide-react';
import { MetricCard } from '@/components/widgets/MetricCard';
import { LiveMonitoringFeed } from '@/components/widgets/LiveMonitoringFeed';
import { CrowdHeatmapView } from '@/components/widgets/CrowdHeatmapView';
import { RiskTrendWidget } from '@/components/widgets/RiskTrendWidget';
import { AIRecommendationsCard } from '@/components/widgets/AIRecommendationsCard';
import { CrowdDensityBarsWidget } from '@/components/widgets/CrowdDensityBarsWidget';
import { TopCongestedZonesTable } from '@/components/widgets/TopCongestedZonesTable';
import { ActiveIncidentsWidget } from '@/components/widgets/ActiveIncidentsWidget';
import { SecurityDeploymentTacticalWidget } from '@/components/widgets/SecurityDeploymentTacticalWidget';
import { ActiveAlertsSidebarWidget } from '@/components/widgets/ActiveAlertsSidebarWidget';
import { SystemStatusNodesWidget } from '@/components/widgets/SystemStatusNodesWidget';
import { SystemResourcesDonutWidget } from '@/components/widgets/SystemResourcesDonutWidget';
import { RecentActionsTimelineWidget } from '@/components/widgets/RecentActionsTimelineWidget';

export default function DashboardPage() {
  return (
    <div className="space-y-3.5 md:space-y-4">
      {/* Row 1: Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <MetricCard
          title="Total People"
          value="24,853"
          trendText="↑ 12.4% vs baseline"
          trendType="up-good"
          icon={Users}
          iconBg="bg-sky-950/70"
          iconColor="text-sky-400"
        />
        <MetricCard
          title="Density (Avg)"
          value="7.8"
          unit="people/m²"
          trendText="↑ High"
          trendType="up-bad"
          icon={Layers}
          iconBg="bg-red-950/70"
          iconColor="text-red-400"
        />
        <MetricCard
          title="Avg Flow Speed"
          value="0.62"
          unit="m/s"
          trendText="↓ 18%"
          trendType="down-bad"
          icon={Activity}
          iconBg="bg-sky-950/70"
          iconColor="text-sky-400"
        />
        <MetricCard
          title="Active Alerts"
          value="12"
          trendText="↓ 3 Critical"
          trendType="down-bad"
          icon={Bell}
          iconBg="bg-orange-950/70"
          iconColor="text-orange-400"
        />
        <MetricCard
          title="Cameras Online"
          value="118 / 128"
          trendText="2 Offline"
          trendType="neutral"
          icon={Camera}
          iconBg="bg-emerald-950/70"
          iconColor="text-emerald-400"
        />
        <MetricCard
          title="IoT Sensors"
          value="58 / 64"
          trendText="6 Offline"
          trendType="neutral"
          icon={Radio}
          iconBg="bg-emerald-950/70"
          iconColor="text-emerald-400"
        />
      </div>

      {/* Main Grid: Left/Center Section (9 cols) + Right Utility Column (3 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 md:gap-4 items-start">
        {/* Left & Center Interactive Visualizers (xl:col-span-9) */}
        <div className="xl:col-span-9 space-y-3.5 md:space-y-4">
          {/* Row A: Live CCTV Stream & Crowd Heatmap Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 md:gap-4 min-h-[340px]">
            <LiveMonitoringFeed />
            <CrowdHeatmapView />
          </div>

          {/* Row B: Risk Trend Chart + AI Recommendations + Density by Zone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 md:gap-4 min-h-[290px]">
            <RiskTrendWidget />
            <AIRecommendationsCard />
            <CrowdDensityBarsWidget />
          </div>

          {/* Row C: Top Congested Zones + Active Incidents + Security Deployment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 md:gap-4 min-h-[260px]">
            <TopCongestedZonesTable />
            <ActiveIncidentsWidget />
            <SecurityDeploymentTacticalWidget />
          </div>
        </div>

        {/* Right Utility Widgets Column (xl:col-span-3) */}
        <div className="xl:col-span-3 space-y-3.5 md:space-y-4">
          <ActiveAlertsSidebarWidget />
          <SystemStatusNodesWidget />
          <SystemResourcesDonutWidget />
          <RecentActionsTimelineWidget />
        </div>
      </div>
    </div>
  );
}
