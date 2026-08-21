'use client';

import React from 'react';
import { Megaphone, AlertCircle } from 'lucide-react';

export default function AnnouncementsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-orange-500" />
              Public Announcements
            </h1>
            <p className="text-sm text-slate-400 mt-1">Broadcast messages and safety instructions to venue screens and mobile apps.</p>
          </div>
          <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-semibold shadow-md transition-colors">
            New Broadcast
          </button>
        </header>

        <div className="flex items-center justify-center min-h-[400px] border border-dashed border-border rounded-xl bg-slate-900/20">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-200">No active broadcasts</h3>
            <p className="text-sm text-slate-400 max-w-sm">
              Use this module to broadcast live audio or display emergency instructions across all connected digital signage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
