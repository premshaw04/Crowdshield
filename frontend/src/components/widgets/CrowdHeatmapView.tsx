'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Flame, Waves, Users, Box, Info, Map as MapIcon, Layers, Settings2, MousePointer2, PlusSquare, Goal, Video, Route } from 'lucide-react';
import { Event as CrowdEvent } from '@/types/event';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { useEventWebSocket } from '@/hooks/events/useEventWebSocket';
import { ZoneHeatmapUpdate } from '@/lib/services';
import { apiConfig } from '@/lib/api/config';
import { WebSocketClient } from '@/lib/websocket/client';
import { WebSocketEventType } from '@/lib/websocket/events';
import { Venue } from '@/types/venue';

// Dynamically import VenueMap to avoid SSR issues with Leaflet
const VenueMap = dynamic(() => import('@/components/maps/VenueMap'), { ssr: false });

interface CrowdHeatmapViewProps {
  event?: CrowdEvent;
  venue?: Venue;
  isConfigurable?: boolean;
  defaultMapMode?: 'OUTDOOR' | 'INDOOR';
}

export const CrowdHeatmapView: React.FC<CrowdHeatmapViewProps> = ({ event, venue, isConfigurable = false, defaultMapMode = 'OUTDOOR' }) => {
  const [mapMode, setMapMode] = useState<'OUTDOOR' | 'INDOOR'>(defaultMapMode);
  const [hasLoadedOutdoor, setHasLoadedOutdoor] = useState(defaultMapMode === 'OUTDOOR');
  const [hasLoadedIndoor, setHasLoadedIndoor] = useState(defaultMapMode === 'INDOOR');
  const [activeTab, setActiveTab] = useState<'heatmap' | 'flow' | 'density'>('heatmap');
  const [is3D, setIs3D] = useState(false);
  
  // Configuration Mode State
  const [interactionMode, setInteractionMode] = useState<'VIEW' | 'CONFIG'>('VIEW');
  const [activeTool, setActiveTool] = useState<'SELECT' | 'ZONE' | 'GATE' | 'CAMERA' | 'ROUTE'>('SELECT');
  
  // Deletion Stub State
  const [dialogConfig, setDialogConfig] = useState<{ isOpen: boolean; targetId: string | null; targetName: string | null }>({ isOpen: false, targetId: null, targetName: null });

  const handleSetMapMode = (mode: 'OUTDOOR' | 'INDOOR') => {
    setMapMode(mode);
    if (mode === 'OUTDOOR') setHasLoadedOutdoor(true);
    if (mode === 'INDOOR') setHasLoadedIndoor(true);
  };

  // WebSocket Integration
  const { latestHeatmap } = useEventWebSocket(event?.id || '');
  const [zoneAnalytics, setZoneAnalytics] = useState<Record<string, ZoneHeatmapUpdate>>({});
  const [isDemoSimulating, setIsDemoSimulating] = useState(false);

  // Listen for WebSocket updates
  React.useEffect(() => {
    if (latestHeatmap && Array.isArray(latestHeatmap)) {
      setZoneAnalytics(prev => {
        const next = { ...prev };
        latestHeatmap.forEach((update: ZoneHeatmapUpdate) => {
          if (update.zoneId) next[update.zoneId] = update;
        });
        return next;
      });
    }
  }, [latestHeatmap]);

  // Demo Mode Simulation
  React.useEffect(() => {
    if (apiConfig.IS_DEMO_MODE && event && event.zones && activeTab === 'heatmap' && mapMode === 'INDOOR') {
      setIsDemoSimulating(true);
      const interval = setInterval(() => {
        const simulatedUpdates = event.zones!.map(zone => {
          const currentDensity = zoneAnalytics[zone.id]?.density || Math.random() * 0.5;
          // Random walk density
          let newDensity = currentDensity + (Math.random() * 0.2 - 0.1);
          newDensity = Math.max(0.05, Math.min(0.98, newDensity));
          
          return {
            eventId: event.id,
            venueId: event.venueId,
            zoneId: zone.id,
            density: newDensity,
            crowdCount: Math.floor(newDensity * zone.capacity),
            timestamp: new Date().toISOString()
          } as ZoneHeatmapUpdate;
        });
        
        WebSocketClient.getInstance(`/${event.id}`).simulateMessage({
          type: WebSocketEventType.HEATMAP_UPDATE,
          payload: simulatedUpdates
        });
      }, 3000); // simulate update every 3 seconds
      
      return () => clearInterval(interval);
    } else {
      setIsDemoSimulating(false);
    }
  }, [event, activeTab, mapMode, zoneAnalytics]); // depend on these to restart sim if changed

  // Auto-generate mock layout for event zones (Demo Mode)
  // Maps a grid layout into the 500x280 SVG canvas
  const dynamicZonesLayout = useMemo(() => {
    if (!event || !event.zones || event.zones.length === 0) return [];
    
    // We'll partition the 450x240 mall outline into a grid depending on number of zones
    const startX = 40;
    const startY = 35;
    const maxWidth = 420;
    const maxHeight = 210;

    const numZones = event.zones.length;
    const cols = Math.ceil(Math.sqrt(numZones));
    const rows = Math.ceil(numZones / cols);

    const cellWidth = maxWidth / cols;
    const cellHeight = maxHeight / rows;

    return event.zones.map((zone, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const width = cellWidth * 0.8; // 80% of cell width for padding
      const height = cellHeight * 0.8;
      const x = startX + (col * cellWidth) + (cellWidth * 0.1);
      const y = startY + (row * cellHeight) + (cellHeight * 0.1);
      
      const cx = x + width / 2;
      const cy = y + height / 2;

      // Map real-time density from WebSocket to Risk Tiers
      const analytics = zoneAnalytics[zone.id];
      const density = analytics ? analytics.density : 0.1; // Default to 0.1 if no data
      const crowdCount = analytics ? analytics.crowdCount : 0;

      let riskLevel = 'SAFE';
      let colorClass = 'text-emerald-400 border-emerald-500/40 shadow-emerald-950/60';
      let textColorClass = 'text-emerald-500';

      if (density >= 0.9) {
        riskLevel = 'CRITICAL';
        colorClass = 'text-purple-400 border-purple-500/80 shadow-purple-950/60';
        textColorClass = 'text-purple-500';
      } else if (density >= 0.75) {
        riskLevel = 'HIGH';
        colorClass = 'text-red-400 border-red-500/80 shadow-red-950/60';
        textColorClass = 'text-red-500';
      } else if (density >= 0.5) {
        riskLevel = 'MEDIUM';
        colorClass = 'text-amber-400 border-amber-500/70 shadow-amber-950/60';
        textColorClass = 'text-amber-500';
      } else if (density >= 0.25) {
        riskLevel = 'LOW';
        colorClass = 'text-yellow-400 border-yellow-500/50 shadow-yellow-950/60';
        textColorClass = 'text-yellow-500';
      }

      return {
        ...zone,
        rect: { x, y, width, height },
        center: { cx, cy },
        riskLevel,
        colorClass,
        textColorClass,
        density,
        crowdCount
      };
    });
  }, [event, zoneAnalytics]);

  const handleObjectClick = (e: React.MouseEvent, id: string, name: string) => {
    if (interactionMode === 'CONFIG' && activeTool === 'SELECT') {
      e.stopPropagation();
      setDialogConfig({ isOpen: true, targetId: id, targetName: name });
    }
  };

  const confirmDeletion = () => {
    console.log(`Deleted object: ${dialogConfig.targetId}`);
    setDialogConfig({ isOpen: false, targetId: null, targetName: null });
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={dialogConfig.isOpen}
        title="Delete Object"
        message={`Are you sure you want to delete ${dialogConfig.targetName}? This action cannot be undone.`}
        confirmText="Delete"
        intent="danger"
        onConfirm={confirmDeletion}
        onCancel={() => setDialogConfig({ isOpen: false, targetId: null, targetName: null })}
      />
      <div className={`bg-[#111622] border ${interactionMode === 'CONFIG' ? 'border-[#f97316] shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-[#1a2334]'} rounded-xl overflow-hidden flex flex-col h-full shadow-sm hover:border-[#25334c] transition-all`}>
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-[#182130] bg-[#111622] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-bold text-slate-100 tracking-wide whitespace-nowrap">
              Location & Map
            </span>
            <span className="text-slate-600 text-xs hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap truncate hidden sm:inline">
              {event ? event.venueName : 'Phoenix Mall'}
            </span>
            {mapMode === 'INDOOR' && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-blue-950/40 border border-blue-900/40 text-blue-400">
                Floor Plan Active
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 flex gap-2 font-mono">
             <span>LAT: {venue?.latitude ? `${venue.latitude.toFixed(4)}° N` : 'N/A'}</span>
             <span>LNG: {venue?.longitude ? `${venue.longitude.toFixed(4)}° E` : 'N/A'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Mode Switcher (View vs Config) */}
          {isConfigurable && mapMode === 'INDOOR' && (
            <div className="flex items-center gap-1 bg-[#1a0f0a]/40 p-0.5 rounded-lg border border-[#f97316]/30">
              <button
                onClick={() => setInteractionMode('VIEW')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  interactionMode === 'VIEW'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                View
              </button>
              <button
                onClick={() => setInteractionMode('CONFIG')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  interactionMode === 'CONFIG'
                    ? 'bg-[#f97316] text-white shadow-sm'
                    : 'text-[#f97316]/60 hover:text-[#f97316]'
                }`}
              >
                <Settings2 size={11} />
                Config Mode
              </button>
            </div>
          )}

          {/* Map Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#0a0e16] p-0.5 rounded-lg border border-[#1b2536]">
            <button
              onClick={() => handleSetMapMode('OUTDOOR')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                mapMode === 'OUTDOOR'
                  ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <MapIcon size={12} />
              Outdoor Map
            </button>
            <button
              onClick={() => handleSetMapMode('INDOOR')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                mapMode === 'INDOOR'
                  ? 'bg-[#d94828]/20 text-[#d94828] border border-[#d94828]/30 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <Layers size={12} />
              Indoor Floor Plan
            </button>
          </div>

          {/* Legend (Only for Indoor mode) */}
          {mapMode === 'INDOOR' && (
            <div className="flex items-center gap-1.5 shrink-0 hidden md:flex">
              {isDemoSimulating && (
                <span className="mr-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black tracking-widest bg-purple-950/70 border border-purple-700/50 text-purple-400 animate-pulse">
                  <Info size={10} />
                  DEMO MODE
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-medium hidden lg:inline">
                Density
              </span>
              <span className="text-[9px] text-slate-500">SAFE</span>
              <div className="w-24 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 via-amber-500 via-red-500 to-purple-600 border border-white/10" />
              <span className="text-[9px] text-slate-500">CRITICAL</span>
            </div>
          )}
        </div>
      </div>


      {/* Map Viewport */}
      <div className="relative flex-1 min-h-[260px] bg-[#0a0e16] overflow-hidden select-none">
        {hasLoadedOutdoor && (
          <div className={`absolute inset-0 z-0 transition-opacity duration-300 ${mapMode === 'OUTDOOR' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
             <VenueMap 
               mode="GEOGRAPHIC" 
               latitude={venue?.latitude || 19.0874} 
               longitude={venue?.longitude || 72.8890} 
               interactive={true} 
               venue={apiConfig.IS_DEMO_MODE && !venue ? {
                 id: 'demo-venue-1',
                 name: 'Phoenix Mall',
                 address: 'LBS Marg',
                 capacity: 10000,
                 boundary: {
                   id: 'b1', name: 'Venue Boundary', type: 'POLYGON',
                   coordinates: [
                     { lat: 19.0880, lng: 72.8880 }, { lat: 19.0880, lng: 72.8900 },
                     { lat: 19.0865, lng: 72.8900 }, { lat: 19.0865, lng: 72.8880 }
                   ]
                 },
                 parkingLocations: [
                   {
                     id: 'p1', name: 'North Parking', type: 'POLYGON',
                     coordinates: [
                       { lat: 19.0882, lng: 72.8885 }, { lat: 19.0882, lng: 72.8895 },
                       { lat: 19.0878, lng: 72.8895 }, { lat: 19.0878, lng: 72.8885 }
                     ]
                   }
                 ],
                 externalGates: [
                   { id: 'g1', name: 'Gate 1', type: 'POINT', coordinates: [{ lat: 19.0873, lng: 72.8880 }] },
                   { id: 'g2', name: 'Gate 2', type: 'POINT', coordinates: [{ lat: 19.0865, lng: 72.8890 }] }
                 ],
                 emergencyAccessRoutes: [
                   { id: 'e1', name: 'West Fire Access', type: 'POLYLINE', coordinates: [{ lat: 19.0875, lng: 72.8875 }, { lat: 19.0873, lng: 72.8880 }] }
                 ],
                 nearbyRoads: [
                   { id: 'r1', name: 'LBS Marg', type: 'POLYLINE', coordinates: [{ lat: 19.0890, lng: 72.8870 }, { lat: 19.0860, lng: 72.8885 }] }
                 ],
                 stats: { zones: 0, gates: 0, cameras: 0, sensors: 0 }
               } as Venue : undefined}
             />
          </div>
        )}

        {hasLoadedIndoor && (
          <div className={`absolute inset-0 p-2 z-0 transition-opacity duration-300 ${mapMode === 'INDOOR' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
            
            {/* Configuration Toolbar Overlay */}
            {isConfigurable && interactionMode === 'CONFIG' && (
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-[#0a0e16]/90 backdrop-blur-md border border-[#f97316]/40 p-1.5 rounded-xl shadow-2xl">
                {[
                  { id: 'SELECT', icon: MousePointer2, label: 'Select' },
                  { id: 'ZONE', icon: PlusSquare, label: 'Add Zone' },
                  { id: 'GATE', icon: Goal, label: 'Add Gate' },
                  { id: 'CAMERA', icon: Video, label: 'Add Camera' },
                  { id: 'ROUTE', icon: Route, label: 'Draw Route' }
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id as 'SELECT' | 'ZONE' | 'GATE' | 'CAMERA' | 'ROUTE')}
                    title={tool.label}
                    aria-label={`Select tool: ${tool.label}`}
                    className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                      activeTool === tool.id
                        ? 'bg-[#f97316]/90 text-white shadow-sm border border-[#f97316]'
                        : 'text-slate-400 hover:text-white hover:bg-[#1a2334]'
                    }`}
                  >
                    <tool.icon size={16} />
                  </button>
                ))}
              </div>
            )}

            {/* CONFIG MODE WARNING BADGE */}
            {interactionMode === 'CONFIG' && (
              <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-red-950/80 border border-red-500/50 rounded shadow-md flex items-center gap-2">
                <Settings2 size={12} className="text-red-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Config Mode Active</span>
              </div>
            )}

            {/* Mall Floorplan Grid & Walls */}
            <svg 
              viewBox="0 0 500 280" 
              className={`w-full h-full object-contain transition-transform duration-500 ${interactionMode === 'CONFIG' && activeTool !== 'SELECT' ? 'cursor-crosshair' : ''}`}
              style={is3D ? { transform: 'rotateX(50deg) rotateZ(-30deg) scale(0.9)', transformStyle: 'preserve-3d' } : undefined}
            >
              {/* Blueprint Grid Lines */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#141c2b" strokeWidth="0.8" />
                </pattern>
                
                {/* Gradients */}
                <radialGradient id="heatCritical" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
                  <stop offset="25%" stopColor="#9333ea" stopOpacity="0.8" />
                  <stop offset="55%" stopColor="#ef4444" stopOpacity="0.6" />
                  <stop offset="80%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatHigh" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                  <stop offset="35%" stopColor="#f97316" stopOpacity="0.75" />
                  <stop offset="65%" stopColor="#eab308" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatMedium" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                  <stop offset="40%" stopColor="#eab308" stopOpacity="0.65" />
                  <stop offset="80%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatLow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#eab308" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatSafe" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                  <stop offset="60%" stopColor="#10b981" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background grid */}
              <rect width="500" height="280" fill="url(#grid)" />

              {/* Main Boundary */}
              <rect x="25" y="20" width="450" height="240" rx="14" fill="#0c121e" stroke="#1d293d" strokeWidth="1.5" />
              
              {/* Default Hardcoded Layout if no event is passed */}
              {!event && (
                <>
                  {/* Zone partitions */}
                  <rect x="40" y="35" width="130" height="100" rx="8" fill="#101726" stroke="#223147" strokeWidth="1" strokeDasharray="3 3" />
                  <rect x="40" y="145" width="130" height="100" rx="8" fill="#101726" stroke="#223147" strokeWidth="1" strokeDasharray="3 3" />
                  <rect x="180" y="35" width="140" height="210" rx="8" fill="#101726" stroke="#223147" strokeWidth="1" strokeDasharray="3 3" />
                  <rect x="330" y="35" width="130" height="100" rx="8" fill="#101726" stroke="#223147" strokeWidth="1" strokeDasharray="3 3" />
                  <rect x="330" y="145" width="130" height="100" rx="8" fill="#101726" stroke="#223147" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Glowing Blobs */}
                  {activeTab === 'heatmap' && (
                    <g className="mix-blend-screen">
                      {/* Zone B Hotspot */}
                      <circle cx="250" cy="120" r="75" fill="url(#heatHigh)" />
                      <circle cx="290" cy="115" r="55" fill="url(#heatHigh)" opacity="0.8" />
                      <circle cx="230" cy="140" r="50" fill="url(#heatHigh)" opacity="0.85" />
                      {/* Zone E Hotspot */}
                      <circle cx="380" cy="175" r="60" fill="url(#heatMedium)" />
                      <circle cx="410" cy="180" r="45" fill="url(#heatMedium)" opacity="0.8" />
                      {/* Zone C Sub-cluster */}
                      <circle cx="370" cy="75" r="45" fill="url(#heatLow)" />
                    </g>
                  )}

                  {/* Flow Arrows */}
                  {activeTab === 'flow' && (
                    <g stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.8">
                      <path d="M 70 80 Q 180 80 240 110" strokeDasharray="4 4" className="animate-pulse" />
                      <path d="M 260 140 Q 320 180 370 180" strokeDasharray="4 4" className="animate-pulse" />
                      <path d="M 70 190 Q 180 190 230 150" strokeDasharray="4 4" className="animate-pulse" />
                    </g>
                  )}
                </>
              )}

              {/* Dynamic Layout for Event Context */}
              {event && dynamicZonesLayout.map((zone) => (
                <rect 
                  key={zone.id}
                  x={zone.rect.x} 
                  y={zone.rect.y} 
                  width={zone.rect.width} 
                  height={zone.rect.height} 
                  rx="8" 
                  fill="#101726" 
                  stroke={interactionMode === 'CONFIG' ? '#f97316' : '#223147'} 
                  strokeWidth="1" 
                  strokeDasharray="3 3"
                  onClick={(e) => handleObjectClick(e, zone.id, zone.name)}
                  className={interactionMode === 'CONFIG' && activeTool === 'SELECT' ? 'cursor-pointer hover:fill-[#1a2436] transition-colors' : ''}
                />
              ))}

              {event && activeTab === 'heatmap' && (
                <g className="mix-blend-screen">
                  {dynamicZonesLayout.map((zone) => {
                    const gradientId = 
                      zone.riskLevel === 'CRITICAL' ? 'url(#heatCritical)' :
                      zone.riskLevel === 'HIGH' ? 'url(#heatHigh)' : 
                      zone.riskLevel === 'MEDIUM' ? 'url(#heatMedium)' : 
                      zone.riskLevel === 'LOW' ? 'url(#heatLow)' : 'url(#heatSafe)';
                    
                    // Base radius on zone size but scale slightly by density
                    const r1 = Math.min(zone.rect.width, zone.rect.height) * 0.6 * (0.8 + zone.density * 0.4);
                    const r2 = r1 * 0.7;
                    const opacity = Math.max(0.3, zone.density);

                    return (
                      <React.Fragment key={`heat-${zone.id}`}>
                        <circle cx={zone.center.cx} cy={zone.center.cy} r={r1} fill={gradientId} opacity={opacity} className="transition-all duration-1000" />
                        <circle cx={zone.center.cx + 10} cy={zone.center.cy - 10} r={r2} fill={gradientId} opacity={opacity * 0.6} className="transition-all duration-1000 delay-100" />
                      </React.Fragment>
                    );
                  })}
                </g>
              )}

            </svg>

            {/* Floating Zone Badges Overlay */}
            
            {/* Default Badges if no event */}
            {!event && (
              <>
                <div className="absolute top-10 left-12 bg-black/60 backdrop-blur-sm border border-emerald-500/40 rounded px-1.5 py-0.5 text-[10px] text-emerald-400 font-medium">
                  Zone A <span className="text-[9px] text-emerald-500">Low</span>
                </div>
                <div className="absolute top-[42%] left-[45%] -translate-x-1/2 -translate-y-1/2 bg-black/75 backdrop-blur-md border border-red-500/80 rounded-md px-2 py-1 text-[11px] font-bold text-red-400 shadow-lg shadow-red-950/60 flex flex-col items-center">
                  <span>Zone B</span>
                  <span className="text-[9px] uppercase tracking-wider text-red-500 font-extrabold">High</span>
                </div>
                <div className="absolute top-10 right-16 bg-black/60 backdrop-blur-sm border border-amber-500/40 rounded px-1.5 py-0.5 text-[10px] text-amber-400 font-medium">
                  Zone C <span className="text-[9px] text-amber-500">Medium</span>
                </div>
                <div className="absolute bottom-12 left-12 bg-black/60 backdrop-blur-sm border border-emerald-500/40 rounded px-1.5 py-0.5 text-[10px] text-emerald-400 font-medium">
                  Zone D <span className="text-[9px] text-emerald-500">Low</span>
                </div>
                <div className="absolute bottom-12 right-20 bg-black/75 backdrop-blur-md border border-amber-500/70 rounded-md px-2 py-0.5 text-[10px] font-semibold text-amber-400 shadow flex flex-col items-center">
                  <span>Zone E</span>
                  <span className="text-[9px] uppercase text-amber-500 font-bold">Medium</span>
                </div>
              </>
            )}

            {/* Dynamic Badges for Event Context */}
            {event && dynamicZonesLayout.map((zone) => {
              // Convert SVG center coords to percentage for absolute positioning over the responsive container
              const leftPercent = (zone.center.cx / 500) * 100;
              const topPercent = (zone.center.cy / 280) * 100;

              return (
                <div 
                  key={`badge-${zone.id}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 bg-black/75 backdrop-blur-md border rounded-md px-2 py-1 text-[10px] font-bold shadow-lg flex flex-col items-center transition-all duration-1000 ${zone.colorClass}`}
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                >
                  <span className="text-center">{zone.name}</span>
                  <span className={`text-[8px] uppercase tracking-wider font-extrabold ${zone.textColorClass}`}>
                    {zone.riskLevel} {(zone.density * 100).toFixed(0)}%
                  </span>
                  <span className="text-[7px] text-slate-400 font-mono mt-0.5">
                    {zone.crowdCount.toLocaleString()} PPL
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Controls Bar (Only for Indoor Mode) */}
      {mapMode === 'INDOOR' && (
        <div className="px-4 py-2 border-t border-[#182130] bg-[#0d121c] flex items-center justify-between">
          {/* Left Switchers: Heatmap / Flow / Density */}
          <div className="flex items-center gap-1 bg-[#121824] p-0.5 rounded-lg border border-[#1b2536]">
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'heatmap'
                  ? 'bg-[#d94828] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame size={12} />
              Heatmap
            </button>

            <button
              onClick={() => setActiveTab('flow')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'flow'
                  ? 'bg-[#d94828] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Waves size={12} />
              Flow
            </button>

            <button
              onClick={() => setActiveTab('density')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'density'
                  ? 'bg-[#d94828] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users size={12} />
              Density
            </button>
          </div>

          {/* Right 3D View Toggle */}
          <button
            onClick={() => setIs3D(!is3D)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              is3D 
                ? 'bg-slate-800 border-slate-600 text-white' 
                : 'border-[#222e42] bg-[#121824] text-slate-300 hover:border-slate-600'
            }`}
          >
            <Box size={13} />
            3D View
          </button>
        </div>
      )}
    </div>
    </>
  );
};
