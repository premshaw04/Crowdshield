'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar/Sidebar';
import { Navbar } from '@/components/organisms/Navbar/Navbar';
import { EventProvider } from '@/lib/context/EventContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lastUpdated, setLastUpdated] = useState('11:42:28 AM');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <EventProvider>
      <div className="flex h-screen overflow-hidden bg-[#0a0e17] text-slate-100 antialiased selection:bg-orange-500/30 selection:text-orange-200">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar />
        
        {/* Main Content Area */}
        <main role="main" className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4 lg:p-5 scrollbar-hide relative">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute inset-0 pointer-events-none z-0" style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(239, 68, 68, 0.04), transparent 50%), radial-gradient(circle at 80% 80%, rgba(249, 87, 56, 0.03), transparent 50%)'
          }} />
          
          <div className="relative z-10 max-w-[1720px] mx-auto">
            {children}
          </div>
        </main>

        {/* Global Footer Bar */}
        <footer className="h-9 px-4 md:px-6 bg-[#080c14] border-t border-[#161f2e] flex items-center justify-between text-[11px] text-slate-500 shrink-0 select-none">
          <div>
            © 2026 CrowdShield AI. All rights reserved.
          </div>
          
          <div className="flex items-center gap-2">
            <span>Data Last Updated: <strong className="text-slate-300 font-mono">{lastUpdated}</strong></span>
            <span className="text-slate-700">•</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Auto Refresh: <strong className="font-semibold text-emerald-300">ON (5s)</strong>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <span>•</span>
            <span className="font-mono text-[10px] text-slate-600">v1.0.0</span>
          </div>
        </footer>
      </div>
    </div>
    </EventProvider>
  );
}


