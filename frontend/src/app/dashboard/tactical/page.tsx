'use client';

import React, { useState } from 'react';
import SecurityTab from './SecurityTab';
import GateControlTab from './GateControlTab';
import AnnouncementsTab from './AnnouncementsTab';

export default function TacticalResponsePage() {
  const [activeTab, setActiveTab] = useState<'security' | 'gates' | 'announcements'>('security');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Tabs */}
      <div className="px-6 pt-6 pb-4 border-b border-border/50">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-4">Tactical Response</h1>
        <div className="flex gap-6 text-sm font-medium">
          <button 
            onClick={() => setActiveTab('security')}
            className={`pb-2 border-b-2 transition-colors ${activeTab === 'security' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Security Deployment
          </button>
          <button 
            onClick={() => setActiveTab('gates')}
            className={`pb-2 border-b-2 transition-colors ${activeTab === 'gates' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Gate Control
          </button>
          <button 
            onClick={() => setActiveTab('announcements')}
            className={`pb-2 border-b-2 transition-colors ${activeTab === 'announcements' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Announcements
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'gates' && <GateControlTab />}
        {activeTab === 'announcements' && <AnnouncementsTab />}
      </div>
    </div>
  );
}
