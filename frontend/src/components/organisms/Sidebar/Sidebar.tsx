'use client';

import React, { useState } from 'react';
import { 
  LayoutGrid, PlayCircle, Flame, Sparkles, 
  AlertTriangle, ClipboardList, DoorClosed, ShieldCheck, Megaphone, 
  Box, SlidersHorizontal, LineChart, 
  Users, Settings, ScrollText, HelpCircle,
  ChevronLeft, ChevronRight, CalendarDays
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { usePathname } from 'next/navigation';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  interface NavItem {
    label: string;
    href: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
        { label: 'Events Management', href: '/dashboard/events', icon: CalendarDays },
        { label: 'Live Monitoring', href: '/dashboard/live-monitoring', icon: PlayCircle },
        { label: 'Spatial Intelligence', href: '/dashboard/spatial', icon: Flame },
      ]
    },
    {
      title: 'RESPONSE',
      items: [
        { label: 'Incident Command', href: '/dashboard/incident-command', icon: AlertTriangle },
        { label: 'Tactical Response', href: '/dashboard/tactical', icon: ShieldCheck },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { label: 'AI Predictions', href: '/dashboard/ai-predictions', icon: Sparkles },
        { label: 'Reports & Analytics', href: '/dashboard/reports', icon: LineChart },
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { label: 'Users & Roles', href: '/dashboard/users-roles', icon: Users },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside 
      className={`relative h-screen bg-[#090d15] border-r border-[#192232] flex flex-col transition-all duration-300 ease-in-out z-50 select-none ${isCollapsed ? 'w-[72px]' : 'w-[230px]'}`} 
      aria-label="Main Navigation"
    >
      {/* Collapse Toggle Button */}
      <button 
        onClick={toggleSidebar} 
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-[#111723] border border-[#232f45] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#f95738] shadow-md z-50 transition-all"
      >
        {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Brand Logo Header */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-[#161f2e] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f95738] via-[#ea580c] to-[#c2410c] flex items-center justify-center shadow-lg shadow-orange-950/60 shrink-0 border border-orange-500/30">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12h6" strokeWidth="2" />
            <path d="M12 9v6" strokeWidth="2" />
          </svg>
        </div>
        
        <div className={`flex flex-col transition-all duration-200 overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[13px] tracking-wider text-white font-sans">
              CROWDSHIELD
            </span>
            <span className="text-[9px] font-extrabold px-1 py-0.2 rounded bg-orange-950/80 text-orange-400 border border-orange-600/50">
              AI
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium tracking-tight">
            Predict. Prevent. Protect.
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-hide space-y-4" aria-label="Sidebar navigation">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-0.5">
            {!isCollapsed && (
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-4 py-1">
                {section.title}
              </div>
            )}
            
            {section.items.map((item) => (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                href={item.href}
                badge={item.badge}
                badgeColor={item.badgeColor}
                isActive={pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer: Need Help & System Status */}
      <div className="p-3 border-t border-[#161f2e] shrink-0 space-y-2 bg-[#090d15]">
        <button className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
          <HelpCircle size={16} />
          {!isCollapsed && <span>Need Help?</span>}
        </button>

        {!isCollapsed ? (
          <div className="bg-[#071d16] border border-[#0d422f] rounded-xl px-3 py-2 flex items-center gap-2 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-bold">System Status</span>
              <span className="text-[11px] text-emerald-300 font-medium">All Systems Operational</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

