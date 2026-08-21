'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, AlertTriangle, Clock, LogIn, MonitorPlay } from 'lucide-react';
import { useEventContext } from '@/lib/context/EventContext';
import { apiConfig } from '@/lib/api/config';

export const Navbar = () => {
  const [time, setTime] = useState('11:42:28 AM');
  const [date, setDate] = useState('24 May 2026, Saturday');
  const [countdown, setCountdown] = useState(392); // 06:32 in seconds
  
  const { activeEvent, isLoading } = useEventContext();
  
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDemoMode(apiConfig.IS_DEMO_MODE);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      // Keep realistic live clock
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'long' }));
      setCountdown((prev) => (prev > 0 ? prev - 1 : 392));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = String(Math.floor(countdown / 60)).padStart(2, '0');
  const seconds = String(countdown % 60).padStart(2, '0');

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0f17]/95 backdrop-blur-md border-b border-[#182130] px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
      {/* Left: Title & Event Subtitle */}
      <div className="flex flex-col shrink-0 min-w-0">
        <h1 className="text-base md:text-lg font-bold text-white tracking-tight leading-tight">
          Dashboard Overview
        </h1>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
          {isLoading ? (
             <span className="w-24 h-4 rounded bg-slate-800 animate-pulse"></span>
          ) : activeEvent ? (
            <>
              <span>{activeEvent.name}</span>
              <span className="text-slate-600">•</span>
              <span>{activeEvent.venueName}</span>
              <span className="text-slate-600">•</span>
              <span className={`inline-flex items-center gap-1.5 font-semibold px-2 py-0.2 rounded-full text-[10px] ${
                activeEvent.status === 'LIVE' ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40' : 
                activeEvent.status === 'UPCOMING' ? 'text-blue-400 bg-blue-950/60 border border-blue-800/40' :
                'text-slate-400 bg-slate-900/60 border border-slate-700/40'
              }`}>
                {activeEvent.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                {activeEvent.status === 'UPCOMING' && <Clock size={10} />}
                {activeEvent.status}
              </span>
            </>
          ) : (
            <span>No Active Event</span>
          )}
        </div>
      </div>

      {/* Center: Demo Mode Toggle & Alerts */}
      <div className="hidden xl:flex items-center gap-4">
        {/* Demo Mode Toggle */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${isDemoMode ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-[#212b3e] bg-[#141a27]'}`}>
          <MonitorPlay size={14} className={isDemoMode ? "text-amber-400 animate-pulse" : "text-slate-500"} />
          <span className={`text-[11px] font-bold tracking-wide ${isDemoMode ? 'text-amber-400' : 'text-slate-300'}`}>
            {isDemoMode ? 'DEMO MODE ACTIVE' : 'DEMO MODE'}
          </span>
          <button 
            onClick={() => apiConfig.setDemoMode(!isDemoMode)}
            className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isDemoMode ? 'bg-amber-500' : 'bg-slate-700'}`}
          >
            <span
              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isDemoMode ? 'translate-x-3' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {/* Critical Risk Glowing Banner */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-[#2a0e0f] via-[#1d1016] to-[#220d0f] border border-red-500/40 rounded-xl px-4 py-1.5 shadow-lg shadow-red-950/30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-extrabold text-red-400 tracking-wider leading-none">
              CRITICAL RISK DETECTED
            </span>
            <span className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
              Crowd crush risk is <span className="text-red-400 font-semibold">HIGH</span> in Food Court (Zone B)
            </span>
          </div>
        </div>

        {/* 82% Risk Value */}
        <div className="text-2xl font-black text-red-500 tracking-tight px-3 border-l border-r border-red-500/20 leading-none">
          82%
        </div>

        {/* Escalation countdown */}
        <div className="flex flex-col text-right">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
            Escalation expected in
          </span>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-sm font-bold text-amber-400 font-mono tracking-wider">
              {minutes}:{seconds}
            </span>
            <span className="text-[10px] text-slate-400">minutes</span>
          </div>
        </div>
      </div>
      </div>

      {/* Right: Live Clock, Search, Notifications, User Profile */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Clock & Date */}
        <div className="hidden md:flex items-center gap-2 text-right">
          <Clock className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-100 font-mono leading-tight">
              {time}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {date}
            </span>
          </div>
        </div>

        {/* Search button */}
        <button 
          aria-label="Search"
          className="w-8 h-8 rounded-lg bg-[#141a27] border border-[#212b3e] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
        >
          <Search size={15} />
        </button>

        {/* Notification Bell with Badge 12 */}
        <button 
          aria-label="Notifications"
          className="relative w-8 h-8 rounded-lg bg-[#141a27] border border-[#212b3e] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
        >
          <Bell size={15} />
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#0b0f17]">
            12
          </span>
        </button>

        {/* Auth / Login */}
        <Link href="/login" className="flex items-center gap-2.5 pl-4 border-l border-[#1f2a3c] cursor-pointer group hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-[#141a27] border border-[#212b3e] flex items-center justify-center text-slate-400 group-hover:text-orange-400 group-hover:border-orange-500/50 transition-all shadow-sm">
            <LogIn size={15} className="mr-0.5" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-100 group-hover:text-white transition-colors">
              Sign In
            </span>
            <span className="text-[10px] text-slate-400 leading-none">
              Authority Access
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
