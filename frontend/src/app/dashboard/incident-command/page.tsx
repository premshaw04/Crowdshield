'use client';

import React, { useState } from 'react';
import { DataTableCard, TableColumn } from '@/components/widgets/DataTableCard';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function IncidentCommandPage() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'incidents'>('alerts');

  const alertColumns: TableColumn[] = [
    { key: 'time', header: 'Time', width: '15%' },
    { key: 'zone', header: 'Zone', width: '20%' },
    { key: 'alert', header: 'Alert', width: '30%' },
    { key: 'level', header: 'Risk Level', width: '15%' },
    { key: 'status', header: 'Status', width: '20%' },
  ];

  const alertData = [
    { time: '11:40 AM', zone: 'Food Court', alert: 'High-density detected', level: 'High', status: 'Active' },
    { time: '11:38 AM', zone: 'Gate 2', alert: 'Overcrowded', level: 'Medium', status: 'Active' },
    { time: '11:37 AM', zone: 'West Wing', alert: 'Unusual movement', level: 'High', status: 'Active' },
    { time: '11:35 AM', zone: 'Billing Counter', alert: 'Long queue', level: 'Low', status: 'Active' },
    { time: '11:34 AM', zone: 'Parking Area', alert: 'Vehicle congestion', level: 'Medium', status: 'Active' },
    { time: '11:32 AM', zone: 'Gate 3', alert: 'Crowd buildup', level: 'High', status: 'Active' },
  ].map((item, i) => ({
    ...item,
    id: i,
    level: (
      <span className={`text-xs font-bold ${
        item.level === 'High' ? 'text-red-500' : item.level === 'Medium' ? 'text-orange-500' : 'text-green-500'
      }`}>
        {item.level}
      </span>
    ),
    status: (
      <span className="text-xs font-semibold flex items-center gap-1.5 text-green-500">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
        {item.status}
      </span>
    )
  }));
  const columns: TableColumn[] = [
    { key: 'id', header: 'Incident ID', width: '15%' },
    { key: 'type', header: 'Type', width: '20%' },
    { key: 'location', header: 'Location', width: '20%' },
    { key: 'reporter', header: 'Reported By', width: '15%' },
    { key: 'time', header: 'Time', width: '15%' },
    { key: 'status', header: 'Status', width: '15%' },
  ];

  const data = [
    { id: 'INC-106', type: 'Medical Emergency', location: 'Food Court', reporter: 'Citizen', time: '11:43 AM', status: 'Active' },
    { id: 'INC-105', type: 'Slip and Fall', location: 'Main Entrance', reporter: 'Citizen', time: '11:28 AM', status: 'Active' },
    { id: 'INC-104', type: 'Fight', location: 'Fashion Zone', reporter: 'Security', time: '11:15 AM', status: 'Active' },
    { id: 'INC-103', type: 'Lost Child', location: 'Parking Area', reporter: 'Citizen', time: '11:00 AM', status: 'Resolved' },
    { id: 'INC-102', type: 'Fire Alarm', location: 'West Wing', reporter: 'System', time: '10:30 AM', status: 'Resolved' },
    { id: 'INC-101', type: 'Crowd Crush', location: 'Gate 2', reporter: 'Security', time: '10:05 AM', status: 'Resolved' },
  ].map(item => ({
    ...item,
    status: (
      <span className={`text-xs font-semibold flex items-center gap-1.5 ${item.status === 'Active' ? 'text-green-500' : 'text-blue-500'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-green-500' : 'bg-blue-500'}`} />
        {item.status}
      </span>
    )
  }));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 h-[calc(100vh-8rem)] min-h-[600px] flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-card/30 p-4 rounded-lg border border-border/50">
        <div>
          <h1 className="text-xl font-bold text-foreground">Incident Command</h1>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
             <button 
               onClick={() => setActiveTab('alerts')}
               className={`${activeTab === 'alerts' ? 'text-primary border-b border-primary' : 'hover:text-foreground'} pb-1 transition-colors`}
             >
               Active Alerts (12)
             </button>
             <button 
               onClick={() => setActiveTab('incidents')}
               className={`${activeTab === 'incidents' ? 'text-primary border-b border-primary' : 'hover:text-foreground'} pb-1 transition-colors`}
             >
               Incident Log (6)
             </button>
          </div>
        </div>
        {activeTab === 'incidents' && (
          <button
            onClick={() => toast.info('New Incident Creation form will open here.')}
            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-md text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={14} /> New Incident
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'alerts' ? (
          <DataTableCard 
            title="Active System Alerts" 
            columns={alertColumns} 
            data={alertData} 
            delay={1} 
          />
        ) : (
          <DataTableCard 
            title="Incident Log" 
            columns={columns} 
            data={data} 
            delay={1} 
          />
        )}
      </div>

    </div>
  );
}
