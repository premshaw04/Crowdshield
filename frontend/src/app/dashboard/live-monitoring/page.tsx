'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { GridCameraCard } from '@/components/organisms/LiveMonitoring/GridCameraCard';
import { CameraSidebar } from '@/components/organisms/LiveMonitoring/CameraSidebar';
import { LayoutGrid, Grid3X3, Filter, Settings2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { monitoringApi, MonitoringCamera } from '@/lib/services';

export default function LiveMonitoringPage() {
  const [cameras, setCameras] = useState<MonitoringCamera[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [layout, setLayout] = useState<'2x2' | '3x3'>('2x2');
  const [expandedCameraId, setExpandedCameraId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeZone, setActiveZone] = useState('All Zones');
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  // 1. Initial REST Fetch
  useEffect(() => {
    let isMounted = true;
    const fetchCameras = async () => {
      setIsLoading(true);
      try {
        const data = await monitoringApi.getActiveCameras('global', activeZone);
        if (isMounted) {
          setCameras(data);
        }
      } catch (err) {
        console.error('Failed to load cameras', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCameras();
    
    return () => { isMounted = false; };
  }, [activeZone]);

  // 2. High-Frequency WebSocket Telemetry
  useEffect(() => {
    const disconnect = monitoringApi.connectMonitoringStream('global', (update) => {
      setCameras(prevCams => 
        prevCams.map(cam => {
          if (cam.id === update.cameraId) {
            return {
              ...cam,
              fps: update.fps,
              ai: update.ai
            };
          }
          return cam;
        })
      );
    });

    return () => disconnect();
  }, []);

  // Filtering (Search query only, zone is handled by REST fetch above, but we double-filter for safety)
  const filteredCameras = useMemo(() => {
    return cameras.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesZone = activeZone === 'All Zones' || c.zone === activeZone;
      return matchesSearch && matchesZone;
    });
  }, [searchQuery, activeZone, cameras]);

  // Determine which cameras to show in the grid
  const gridCameras = expandedCameraId 
    ? cameras.filter(c => c.id === expandedCameraId)
    : filteredCameras.slice(0, layout === '2x2' ? 4 : 9);

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border border-border/50 overflow-hidden">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/20">
        <div>
          <h1 className="text-lg font-bold text-foreground">Live Monitoring</h1>
          <span className="text-xs text-muted-foreground">{cameras.length} Cameras Active</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-black/40 border border-white/5 rounded-md p-1">
            <button 
              onClick={() => { setLayout('2x2'); setExpandedCameraId(null); }}
              className={`p-1.5 rounded transition-colors ${layout === '2x2' && !expandedCameraId ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => { setLayout('3x3'); setExpandedCameraId(null); }}
              className={`p-1.5 rounded transition-colors ${layout === '3x3' && !expandedCameraId ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid3X3 size={16} />
            </button>
          </div>

          <div className="h-6 w-px bg-border/50" />
          
          <select 
            value={activeZone}
            onChange={(e) => setActiveZone(e.target.value)}
            className="bg-black/40 border border-white/5 text-xs text-foreground rounded-md px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary"
          >
            <option>All Zones</option>
            <option>Zone A</option>
            <option>Zone B</option>
            <option>Zone C</option>
          </select>

          <button className="p-1.5 rounded bg-black/40 border border-white/5 text-muted-foreground hover:text-foreground">
            <Filter size={16} />
          </button>
          <button className="p-1.5 rounded bg-black/40 border border-white/5 text-muted-foreground hover:text-foreground">
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Camera Grid */}
        <div className="flex-1 p-4 overflow-y-auto bg-black/20">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
               <Loader2 className="animate-spin mb-4" size={32} />
               <p>Initializing Camera Streams...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div 
                className={`grid gap-4 h-full ${
                  expandedCameraId ? 'grid-cols-1 grid-rows-1' : 
                  layout === '2x2' ? 'grid-cols-1 md:grid-cols-2 grid-rows-2' : 
                  'grid-cols-2 md:grid-cols-3 grid-rows-3'
                }`}
              >
                {gridCameras.map((cam) => (
                  <GridCameraCard
                    key={cam.id}
                    id={cam.id}
                    name={cam.name}
                    status={cam.status}
                    fps={cam.fps}
                    imageUrl={cam.imageUrl}
                    aiMetrics={cam.ai}
                    isExpanded={expandedCameraId === cam.id}
                    onToggleExpand={() => setExpandedCameraId(expandedCameraId === cam.id ? null : cam.id)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Right Sidebar */}
        <CameraSidebar 
          cameras={filteredCameras}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCameraId={selectedCameraId}
          onSelectCamera={(id) => {
            setSelectedCameraId(id);
            if (expandedCameraId) setExpandedCameraId(id);
          }}
        />

      </div>
    </div>
  );
}
