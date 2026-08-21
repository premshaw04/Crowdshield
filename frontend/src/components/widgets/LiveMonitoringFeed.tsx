'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, ArrowUpRight, ArrowDownRight, Radio } from 'lucide-react';
import Image from 'next/image';

export const LiveMonitoringFeed: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [peopleCount, setPeopleCount] = useState(384);
  const [density, setDensity] = useState(7.2);
  const [speed, setSpeed] = useState(0.48);
  const [fps, setFps] = useState(29);

  // Micro jitter for live feel
  useEffect(() => {
    const interval = setInterval(() => {
      setPeopleCount((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
      setFps(Math.floor(28 + Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const boundingBoxes = [
    { id: 'ID: 425', x: '18%', y: '30%', w: '62px', h: '125px' },
    { id: 'ID: 423', x: '35%', y: '28%', w: '65px', h: '135px' },
    { id: 'ID: 428', x: '49%', y: '26%', w: '60px', h: '130px' },
    { id: 'ID: 429', x: '65%', y: '27%', w: '64px', h: '128px' },
    { id: 'ID: 431', x: '78%', y: '32%', w: '58px', h: '120px' },
    { id: 'ID: 435', x: '26%', y: '34%', w: '55px', h: '115px' },
  ];

  return (
    <div 
      ref={containerRef}
      className={`bg-[#111622] border border-[#1a2334] rounded-xl overflow-hidden flex flex-col h-full shadow-sm hover:border-[#25334c] transition-all ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none' : ''}`}
    >
      {/* Card Header */}
      <div className="px-4 py-2.5 border-b border-[#182130] bg-[#111622] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm font-bold text-white tracking-wide">
            Live Monitoring
          </span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-xs text-slate-300 font-medium">Main Entrance</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 border border-emerald-700/50 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE
          </span>
          
          <span className="font-mono text-[11px] text-slate-400">
            FPS: <strong className="text-slate-200">{fps}</strong>
          </span>

          <button onClick={toggleFullscreen} aria-label="Fullscreen" className="text-slate-400 hover:text-white transition-colors">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* CCTV Viewport Container */}
      <div className="relative flex-1 min-h-[220px] bg-[#090d15] overflow-hidden group">
        {/* Background Image Feed */}
        <div className="absolute inset-0">
          <Image
            src="/images/mall_cctv_feed.png"
            alt="Main Entrance Surveillance Camera Feed"
            fill
            className="object-cover opacity-85 group-hover:scale-[1.02] transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          {/* CCTV Grid & Ambient Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111622] via-transparent to-black/30 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none" />
        </div>

        {/* AI Tracking Bounding Boxes Overlay */}
        {boundingBoxes.map((box, idx) => (
          <div
            key={idx}
            className="absolute border border-emerald-400/90 bg-emerald-500/10 pointer-events-none transition-all duration-300 flex flex-col justify-start"
            style={{
              left: box.x,
              top: box.y,
              width: box.w,
              height: box.h,
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
            }}
          >
            {/* Tag badge top */}
            <div className="self-start -mt-3.5 ml-0 bg-emerald-950/90 border border-emerald-400/80 px-1 py-0 text-[9px] font-mono font-bold text-emerald-300 rounded shadow">
              {box.id}
            </div>

            {/* Corner reticles */}
            <div className="w-1.5 h-1.5 border-t border-l border-emerald-300 absolute -top-0.5 -left-0.5" />
            <div className="w-1.5 h-1.5 border-t border-r border-emerald-300 absolute -top-0.5 -right-0.5" />
            <div className="w-1.5 h-1.5 border-b border-l border-emerald-300 absolute -bottom-0.5 -left-0.5" />
            <div className="w-1.5 h-1.5 border-b border-r border-emerald-300 absolute -bottom-0.5 -right-0.5" />
          </div>
        ))}

        {/* Camera Stamp Overlay */}
        <div className="absolute top-2.5 left-3 font-mono text-[10px] text-emerald-400 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1.5">
          <Radio className="w-3 h-3 animate-pulse" />
          CAM-01 • REC [HD]
        </div>
      </div>

      {/* Bottom Telemetry Strip (4 Metrics) */}
      <div className="grid grid-cols-4 divide-x divide-[#192232] border-t border-[#182130] bg-[#0d121c] py-2 px-1">
        {/* People Count */}
        <div className="px-2.5 flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium">People Count</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base font-bold text-white leading-tight">{peopleCount}</span>
            <span className="text-[10px] font-semibold text-emerald-400 flex items-center">
              ↑ 36
            </span>
          </div>
        </div>

        {/* Density */}
        <div className="px-2.5 flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium">Density</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base font-bold text-white leading-tight">{density} <span className="text-[10px] text-slate-400 font-normal">/m²</span></span>
            <span className="text-[10px] font-semibold text-red-400 flex items-center">
              ↑ High
            </span>
          </div>
        </div>

        {/* Avg Speed */}
        <div className="px-2.5 flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium">Avg Speed</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base font-bold text-white leading-tight">{speed} <span className="text-[10px] text-slate-400 font-normal">m/s</span></span>
            <span className="text-[10px] font-semibold text-red-400 flex items-center">
              ↓ 21%
            </span>
          </div>
        </div>

        {/* Flow Direction */}
        <div className="px-2.5 flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium">Flow Direction</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base font-bold text-purple-400 leading-tight">SW</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-400 -rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );
};
