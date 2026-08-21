'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Maximize2, Video, Activity, Users, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface GridCameraCardProps {
  id: string;
  name: string;
  status: 'live' | 'offline' | 'recording';
  fps?: number;
  imageUrl?: string;
  videoUrl?: string;
  aiMetrics?: {
    crowdCount: number;
    density: string;
    risk: 'Low' | 'Medium' | 'High';
    motionDetected: boolean;
  };
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const GridCameraCard: React.FC<GridCameraCardProps> = React.memo(({
  id,
  name,
  status,
  fps = 30,
  imageUrl,
  videoUrl,
  aiMetrics,
  isExpanded,
  onToggleExpand
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const riskColors = {
    Low: 'text-green-500 border-green-500/20 bg-green-500/10',
    Medium: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10',
    High: 'text-red-500 border-red-500/20 bg-red-500/10',
  };

  return (
    <Card 
      className={`relative overflow-hidden border-border/50 bg-black/60 group transition-all duration-300 ${isExpanded ? 'col-span-full row-span-full h-full' : 'h-full min-h-[250px]'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image / Video Simulation */}
      {videoUrl ? (
        <video 
          src={videoUrl} 
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ opacity: status === 'offline' ? 0.3 : 0.7 }}
        />
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${imageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80'})`, opacity: status === 'offline' ? 0.3 : 0.7 }}
        />
      )}
      
      {/* Scanline Overlay */}
      {status !== 'offline' && (
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none" />
      )}

      {/* Top Gradient */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />

      {/* Header Info */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-semibold tracking-wide bg-black/40 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 shadow-sm">
              {name}
            </span>
          </div>
          {status !== 'offline' && (
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
              {status === 'recording' && (
                <span className="text-[10px] font-bold text-white bg-red-600/40 border border-red-500/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                  REC
                </span>
              )}
            </div>
          )}
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          {fps && status !== 'offline' && (
             <span className="text-[10px] font-mono text-green-400 bg-black/60 px-1.5 py-0.5 rounded border border-green-500/20">
               {fps} FPS
             </span>
          )}
          {onToggleExpand && (
            <button 
              onClick={onToggleExpand}
              className={`p-1.5 rounded bg-black/40 hover:bg-primary border border-white/10 hover:border-primary text-white transition-all backdrop-blur-sm ${isHovered ? 'opacity-100' : 'opacity-0'} lg:opacity-100`}
            >
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* AI Overlays */}
      {aiMetrics && status !== 'offline' && (
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-10 items-end">
          {aiMetrics.motionDetected && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-[10px] font-bold text-yellow-500 bg-black/60 border border-yellow-500/30 px-2 py-1 rounded shadow-sm backdrop-blur-md"
            >
              <Activity size={12} className="animate-pulse" /> MOTION DETECTED
            </motion.div>
          )}
          <div className="flex flex-col gap-1 bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded shadow-lg min-w-[120px]">
             <div className="flex justify-between items-center text-[10px] text-muted-foreground border-b border-white/5 pb-1 mb-1">
               <span className="flex items-center gap-1"><BrainCircuit size={10} className="text-primary"/> AI Analytics</span>
             </div>
             <div className="flex justify-between items-center text-xs">
               <span className="text-muted-foreground flex items-center gap-1"><Users size={10} /> Count</span>
               <span className="text-white font-semibold">{aiMetrics.crowdCount}</span>
             </div>
             <div className="flex justify-between items-center text-xs">
               <span className="text-muted-foreground">Density</span>
               <span className="text-white font-semibold">{aiMetrics.density}</span>
             </div>
             <div className="flex justify-between items-center text-xs mt-1">
               <span className="text-muted-foreground">Risk</span>
               <span className={`px-1.5 rounded text-[10px] font-bold ${riskColors[aiMetrics.risk]}`}>
                 {aiMetrics.risk}
               </span>
             </div>
          </div>
        </div>
      )}

      {/* Offline State */}
      {status === 'offline' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10">
          <Video size={32} className="text-muted-foreground opacity-30 mb-2" />
          <span className="text-xs text-muted-foreground font-medium bg-black/60 px-3 py-1 rounded border border-white/5">Connection Lost</span>
        </div>
      )}
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
      
      {/* Decorative Bounding Boxes (Simulated AI) */}
      {isHovered && status !== 'offline' && (
         <div className="absolute top-[30%] left-[40%] w-[15%] h-[40%] border border-primary/40 bg-primary/5 rounded-sm pointer-events-none z-0">
           <span className="absolute -top-4 left-0 text-[8px] bg-primary/40 text-white px-1">Person 92%</span>
         </div>
      )}
    </Card>
  );
});

GridCameraCard.displayName = 'GridCameraCard';

// Need to import BrainCircuit, adding it below to avoid rewrite overhead
import { BrainCircuit } from 'lucide-react';
