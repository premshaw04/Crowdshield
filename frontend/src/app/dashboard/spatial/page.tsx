'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Calendar, ChevronDown, Maximize2, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { Loading } from '@/components/ui/loading';

// Dynamically import map to prevent SSR issues
const HeatmapViewer = dynamic(() => import('@/components/maps/HeatmapViewer').then(mod => mod.HeatmapViewer), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <Loading text="Loading Map Engine..." size={24} />
    </div>
  )
});

const ZONES = ['All Zones', 'Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];

export default function SpatialIntelligencePage() {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'digital-twin' | 'simulation'>('heatmap');
  const [activeZone, setActiveZone] = useState('All Zones');
  const [floor, setFloor] = useState('Floor 1');

  return (
    <div className="relative w-full h-[calc(100vh-2rem)] rounded-xl border border-border/50 overflow-hidden bg-background flex flex-col">
      
      {/* Top Header Tabs */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10 shadow-xl">
        <button 
          onClick={() => setActiveTab('heatmap')}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'heatmap' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Live Heatmap
        </button>
        <button 
          onClick={() => setActiveTab('digital-twin')}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'digital-twin' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Digital Twin
        </button>
        <button 
          onClick={() => setActiveTab('simulation')}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'simulation' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Simulation Engine
        </button>
      </div>

      {activeTab === 'heatmap' && (
        <>
          {/* Absolute Layer: Interactive Map */}
          <HeatmapViewer activeZone={activeZone} />

      {/* Floating UI Overlays (z-10 ensures they sit above map) */}
      
      {/* Top Left: Title & Sidebar-ish Search */}
      <div className="absolute top-4 left-4 z-10 flex gap-4">
         <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3 w-64 shadow-2xl flex flex-col gap-3 hidden md:flex">
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live Monitoring
            </h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search cameras..." 
                className="w-full pl-8 h-8 text-xs bg-black/40 border border-white/5 rounded-md focus:ring-1 focus:ring-primary outline-none text-white"
              />
            </div>
            <div className="flex flex-col gap-1 mt-2">
              {['Main Entrance', 'Food Court', 'Parking Area'].map((cam, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5">
                  <span className="text-xs text-white/80">{cam}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                </div>
              ))}
            </div>
         </div>
      </div>

      {/* Top Right: Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        {/* Floor Selector */}
        <button className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-md text-xs font-semibold text-white hover:bg-white/10 transition-colors shadow-lg">
          {floor} <ChevronDown size={14} className="text-muted-foreground" />
        </button>

        {/* Date/Time */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-md text-xs font-medium text-white shadow-lg">
          <Calendar size={14} className="text-muted-foreground" />
          Today, 11:45 AM
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-md shadow-lg">
          <button className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors" aria-label="Filters">
            <SlidersHorizontal size={14} />
          </button>
          <button className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors" aria-label="Replay">
            <RotateCcw size={14} />
          </button>
          <button className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors" aria-label="Fullscreen">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Right Center: Density Legend */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 flex flex-col items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-full shadow-2xl">
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">High</span>
        <div className="w-2 h-32 rounded-full bg-gradient-to-b from-red-500 via-yellow-500 to-green-500" />
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Low</span>
      </div>

      {/* Bottom Center: Zone Toggles */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center bg-black/70 backdrop-blur-lg border border-white/10 p-1 rounded-full shadow-2xl overflow-x-auto max-w-[90vw]">
          {ZONES.map((zone) => (
            <button
              key={zone}
              onClick={() => setActiveZone(zone)}
              className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                activeZone === zone 
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Title inside map view (optional, to match aesthetic) */}
      <div className="absolute top-4 left-[300px] z-10 hidden lg:block">
        <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-md">Spatial Intelligence</h2>
      </div>
      </>)}

      {activeTab === 'digital-twin' && (
        <div className="flex-1 flex items-center justify-center bg-slate-950">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
              <span className="text-2xl">🏙️</span>
            </div>
            <h3 className="text-lg font-bold text-white">Digital Twin View</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              The 3D BIM model of the venue is loading. Real-time IoT sensors will map directly onto structural assets.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'simulation' && (
        <div className="flex-1 flex items-center justify-center bg-slate-950">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
              <span className="text-2xl">🔬</span>
            </div>
            <h3 className="text-lg font-bold text-white">Simulation Engine Offline</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              The physics-based crowd simulation engine is currently idle. Configure parameters to start a new predictive model.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
