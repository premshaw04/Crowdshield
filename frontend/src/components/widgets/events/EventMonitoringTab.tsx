'use client';

import React, { useState, useEffect } from 'react';
import { Event as CrowdEvent, EventCamera } from '@/types/event';
import { Venue } from '@/types/venue';
import { Maximize2, Radio, Camera as CameraIcon, LayoutGrid, Info, Loader2 } from 'lucide-react';
import { CrowdHeatmapView } from '@/components/widgets/CrowdHeatmapView';
import { venuesDemo } from '@/lib/services/venues/venues.demo'; // Using demo service for now, should switch to actual API if implemented

interface EventMonitoringTabProps {
  event: CrowdEvent;
}

export const EventMonitoringTab: React.FC<EventMonitoringTabProps> = ({ event }) => {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isVenueLoading, setIsVenueLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        if (event.venueId) {
          const v = await venuesDemo.getVenueById(event.venueId);
          setVenue(v);
        }
      } catch (err) {
        console.error("Failed to fetch venue data for monitoring", err);
      } finally {
        setIsVenueLoading(false);
      }
    };
    fetchVenue();
  }, [event.venueId]);

  // If the event isn't active, show an offline state.
  if (event.status !== 'LIVE' && event.status !== 'PAUSED') {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-slate-400 bg-[#111622] border border-[#1a2334] rounded-xl shadow-sm">
        <CameraIcon size={48} className="mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-white mb-2">Monitoring Offline</h3>
        <p className="max-w-md text-center text-sm">
          Event is currently <strong>{event.status}</strong>. Live camera feeds and AI analysis will activate once the event is started.
        </p>
      </div>
    );
  }

  // Find the cameras. Use the first one as MVP.
  const activeCameras = event.cameras?.filter(c => c.status === 'ONLINE') || [];
  const mvpCamera = activeCameras.length > 0 ? activeCameras[0] : null;

  if (!mvpCamera) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-slate-400 bg-[#111622] border border-[#1a2334] rounded-xl shadow-sm">
        <CameraIcon size={48} className="mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-white mb-2">No Active Cameras</h3>
        <p className="max-w-md text-center text-sm">
          There are no online cameras configured for this event. Please update the event infrastructure to enable monitoring.
        </p>
      </div>
    );
  }

  // Smart Default for Map Mode
  // If the event is Shopping, Concert, or the venue is explicitly a Mall, default to INDOOR.
  // Otherwise, default to OUTDOOR.
  const isIndoorLikely = 
    event.eventType === 'SHOPPING' || 
    event.eventType === 'CONCERT' || 
    event.venueName.toLowerCase().includes('mall') ||
    event.venueName.toLowerCase().includes('indoor');

  const defaultMapMode = isIndoorLikely ? 'INDOOR' : 'OUTDOOR';

  if (isVenueLoading) {
    return (
      <div className="flex justify-center items-center h-96 text-slate-500">
        <Loader2 size={32} className="animate-spin mb-4" />
        <span className="ml-3 font-medium">Loading command center...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Context Bar */}
      <div className="flex items-center justify-between bg-[#111622] border border-[#1a2334] rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <LayoutGrid size={16} className="text-blue-400" />
            {activeCameras.length} Active Feeds
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span>Venue: {event.venueId || event.venueName}</span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span>Configured Zones: {event.zones?.length || 0}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-950/40 border border-blue-900/40 text-blue-400 text-[10px] font-bold tracking-wider uppercase">
            <Info size={12} />
            Demo Thresholds active
          </span>
        </div>
      </div>

      {/* Main Monitoring Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Intelligent Map & Analytics (Takes up 2 cols) */}
        <div className="xl:col-span-2 flex flex-col h-[550px]">
          <CrowdHeatmapView event={event} venue={venue || undefined} defaultMapMode={defaultMapMode} />
        </div>

        {/* Right Side: Camera Feeds (Takes up 1 col) */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <EventCameraFeed camera={mvpCamera} eventStatus={event.status} />
        </div>

      </div>

    </div>
  );
};

// Internal component for rendering the camera feed
const EventCameraFeed = ({ camera, eventStatus }: { camera: EventCamera; eventStatus: string }) => {
  const [fps, setFps] = useState(29);

  // Micro jitter for live feel
  useEffect(() => {
    if (eventStatus !== 'LIVE') return;
    const interval = setInterval(() => {
      setFps(Math.floor(28 + Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, [eventStatus]);

  const isDemo = camera.sourceType === 'DEMO_VIDEO' || camera.sourceType === 'UPLOADED_VIDEO';
  const isLive = eventStatus === 'LIVE';

  return (
    <div className="bg-[#111622] border border-[#1a2334] rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
      {/* Card Header */}
      <div className="px-4 py-3 border-b border-[#182130] bg-[#0c1018] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <CameraIcon size={16} className="text-slate-400" />
            {camera.name}
          </span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-xs text-slate-400 font-medium font-mono">{camera.id}</span>
          {camera.associatedZoneId && (
            <>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs text-slate-400 font-medium">Zone: {camera.associatedZoneId}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badges */}
          {isDemo && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black tracking-widest bg-purple-950/70 border border-purple-700/50 text-purple-400">
              DEMO MODE
            </span>
          )}
          
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            isLive 
              ? 'bg-emerald-950/70 border-emerald-700/50 text-emerald-400' 
              : 'bg-yellow-950/70 border-yellow-700/50 text-yellow-400'
          }`}>
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
            {isLive ? 'LIVE' : 'PAUSED'}
          </span>
          
          <span className="font-mono text-[11px] text-slate-400 ml-2">
            FPS: <strong className="text-slate-200">{isLive ? fps : 0}</strong>
          </span>

          <button aria-label="Fullscreen" className="text-slate-400 hover:text-white transition-colors ml-2">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Viewport Container */}
      <div className="relative flex-1 bg-[#05070a] overflow-hidden group flex items-center justify-center">
        
        {/* Video Player */}
        {camera.videoUrl ? (
          <video
            src={camera.videoUrl}
            autoPlay={isLive}
            loop
            muted
            className={`w-full h-full object-cover transition-opacity duration-500 ${isLive ? 'opacity-100' : 'opacity-50 grayscale'}`}
          />
        ) : (
          <div className="text-slate-500 flex flex-col items-center">
            <CameraIcon size={48} className="mb-2 opacity-50" />
            <p>No video source provided.</p>
          </div>
        )}

        {/* Ambient Gradients (matches LiveMonitoringFeed) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111622] via-transparent to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none" />

        {/* Camera Stamp Overlay */}
        <div className="absolute top-4 left-4 font-mono text-[10px] text-emerald-400 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-2 shadow-lg">
          <Radio className={`w-3 h-3 ${isLive ? 'animate-pulse' : ''}`} />
          {camera.name.toUpperCase()} • {isLive ? 'REC' : 'PAUSED'} [HD]
        </div>

        {/* AI Tracking Placeholders (hidden if not live) */}
        {isLive && (
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             {/* Bounding Box Mock */}
             <div
                className="absolute border border-emerald-400/90 bg-emerald-500/10 pointer-events-none transition-all duration-300 flex flex-col justify-start"
                style={{ left: '45%', top: '30%', width: '100px', height: '200px', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}
              >
                <div className="self-start -mt-4 ml-0 bg-emerald-950/90 border border-emerald-400/80 px-1 py-0 text-[10px] font-mono font-bold text-emerald-300 rounded shadow">
                  ID: DEMO-AI
                </div>
                {/* Corner reticles */}
                <div className="w-2 h-2 border-t-2 border-l-2 border-emerald-300 absolute -top-0.5 -left-0.5" />
                <div className="w-2 h-2 border-t-2 border-r-2 border-emerald-300 absolute -top-0.5 -right-0.5" />
                <div className="w-2 h-2 border-b-2 border-l-2 border-emerald-300 absolute -bottom-0.5 -left-0.5" />
                <div className="w-2 h-2 border-b-2 border-r-2 border-emerald-300 absolute -bottom-0.5 -right-0.5" />
              </div>
          </div>
        )}
      </div>
      
    </div>
  );
};
