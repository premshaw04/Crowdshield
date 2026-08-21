'use client';

import React, { useEffect, useState } from 'react';
import { eventService } from '@/lib/services';
import { Event as CrowdEvent, EventStatus } from '@/types/event';
import { EventStatusBadge } from '@/components/widgets/events/EventBadges';
import { EventOverviewTab } from '@/components/widgets/events/EventOverviewTab';
import { EventMonitoringTab } from '@/components/widgets/events/EventMonitoringTab';
import { CrowdHeatmapView } from '@/components/widgets/CrowdHeatmapView';
import { EventSafetyTab } from '@/components/widgets/events/EventSafetyTab';
import { EventAuditLogTab } from '@/components/widgets/events/EventAuditLogTab';
import { EventCamerasTab } from '@/components/widgets/events/EventCamerasTab';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { DuplicateEventDialog } from '@/components/ui/DuplicateEventDialog';
import { Play, Pause, Square, Loader2, Copy } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

const TABS = [
  'Overview',
  'Monitoring',
  'Zones',
  'Gates',
  'Cameras',
  'Safety',
  'Incidents',
  'Reports',
  'Audit Log'
];

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId as string;
  const [event, setEvent] = useState<CrowdEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      const data = await eventService.getEventById(eventId);
      setEvent(data);
      setIsLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  const [dialogConfig, setDialogConfig] = useState<{ isOpen: boolean; type: 'start' | 'end' | null }>({ isOpen: false, type: null });
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Duplicate state
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = async (newName: string) => {
    if (!event) return;
    setIsDuplicating(true);
    try {
      const newEvent = await eventService.duplicateEvent(event.id, newName);
      setIsDuplicateDialogOpen(false);
      // Redirect to the new event
      router.push(`/dashboard/events/${newEvent.id}`);
    } catch (err) {
      console.error('Failed to duplicate event', err);
      setIsDuplicating(false);
    }
  };

  const executeStatusUpdate = async (newStatus: EventStatus) => {
    if (!event) return;
    setIsUpdating(true);
    setActionSuccess(null);
    try {
      // Simulate STARTING intermediate state if starting
      if (newStatus === 'LIVE' && event.status === 'UPCOMING') {
        setEvent(prev => prev ? { ...prev, status: 'STARTING' } : prev);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Synthetic delay for processing UI
      }

      let updated;
      if (newStatus === 'LIVE' && event.status === 'UPCOMING') {
        updated = await eventService.startEvent(event.id);
      } else if (newStatus === 'PAUSED') {
        updated = await eventService.pauseEvent(event.id);
      } else if (newStatus === 'LIVE' && event.status === 'PAUSED') {
        updated = await eventService.resumeEvent(event.id);
      } else if (newStatus === 'COMPLETED') {
        updated = await eventService.endEvent(event.id);
      } else {
        updated = await eventService.updateEvent(event.id, { status: newStatus });
      }
      setActionSuccess(newStatus);
      setEvent(updated); // Update the whole event immediately so the header reflects the change
      
      // Keep success state visible briefly on the buttons
      setTimeout(() => {
        setActionSuccess(null);
        setDialogConfig({ isOpen: false, type: null });
        setIsUpdating(false);
      }, 1500);

    } catch (error) {
      console.error('Failed to update event status', error);
      setIsUpdating(false);
    }
  };

  const handleConfirmDialog = () => {
    if (dialogConfig.type === 'start') {
      executeStatusUpdate('LIVE');
    } else if (dialogConfig.type === 'end') {
      executeStatusUpdate('COMPLETED');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        <Loader2 className="animate-spin mr-2" size={20} />
        Loading event details...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center h-64 text-red-400">
        Event not found.
      </div>
    );
  }

  // Determine valid actions
  const canStart = event.status === 'UPCOMING';
  const canPause = event.status === 'LIVE';
  const canResume = event.status === 'PAUSED';
  const canEnd = event.status === 'LIVE' || event.status === 'PAUSED';

  return (
    <div className="flex flex-col h-full space-y-6">
      
      <ConfirmationDialog
        isOpen={dialogConfig.isOpen}
        title={dialogConfig.type === 'start' ? 'Start Event' : 'End Event'}
        message={dialogConfig.type === 'start' 
          ? 'Starting this event will activate crowd monitoring and AI analysis.'
          : 'Ending this event will stop active monitoring and generate the event report.'}
        confirmText={dialogConfig.type === 'start' ? 'Start Event' : 'End Event'}
        intent={dialogConfig.type === 'start' ? 'primary' : 'danger'}
        isProcessing={isUpdating}
        onConfirm={handleConfirmDialog}
        onCancel={() => setDialogConfig({ isOpen: false, type: null })}
      />

      <DuplicateEventDialog
        isOpen={isDuplicateDialogOpen}
        originalEventName={event.name}
        isProcessing={isDuplicating}
        onConfirm={handleDuplicate}
        onCancel={() => setIsDuplicateDialogOpen(false)}
      />

      {/* Header */}
      <div className="bg-[#0c1018] border border-[#1a2334] rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            {event.name}
            <EventStatusBadge status={event.status} />
          </h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              {event.venueName}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              {new Date(event.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {' – '}
              {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsDuplicateDialogOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 bg-[#0c1018] hover:bg-[#111622] border border-[#1a2334] rounded-lg transition-colors"
            title="Duplicate Event"
          >
            <Copy size={16} />
            Duplicate
          </button>
          
          {canStart && (
            <button 
              onClick={() => setDialogConfig({ isOpen: true, type: 'start' })}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-all shadow shadow-emerald-900/20 disabled:opacity-50"
            >
              {actionSuccess === 'LIVE' ? (
                <>✓ Success</>
              ) : isUpdating ? (
                <><Loader2 size={16} className="animate-spin" /> Processing...</>
              ) : (
                <><Play size={16} /> Start Event</>
              )}
            </button>
          )}
          
          {canPause && (
            <button 
              onClick={() => executeStatusUpdate('PAUSED')}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-semibold rounded-lg transition-all shadow shadow-yellow-900/20 disabled:opacity-50"
            >
              {actionSuccess === 'PAUSED' ? (
                <>✓ Paused</>
              ) : isUpdating ? (
                <><Loader2 size={16} className="animate-spin" /> Processing...</>
              ) : (
                <><Pause size={16} /> Pause Event</>
              )}
            </button>
          )}

          {canResume && (
            <button 
              onClick={() => executeStatusUpdate('LIVE')}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-all shadow shadow-emerald-900/20 disabled:opacity-50"
            >
              {actionSuccess === 'LIVE' ? (
                <>✓ Resumed</>
              ) : isUpdating ? (
                <><Loader2 size={16} className="animate-spin" /> Processing...</>
              ) : (
                <><Play size={16} /> Resume Event</>
              )}
            </button>
          )}

          {canEnd && (
            <button 
              onClick={() => setDialogConfig({ isOpen: true, type: 'end' })}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all shadow shadow-red-900/20 disabled:opacity-50"
            >
              {actionSuccess === 'COMPLETED' ? (
                <>✓ Ended</>
              ) : isUpdating ? (
                <><Loader2 size={16} className="animate-spin" /> Processing...</>
              ) : (
                <><Square size={16} /> End Event</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#212b3e]">
        <div className="flex overflow-x-auto hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === tab
                  ? 'border-white text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-[400px] mt-6">
        {activeTab === 'Overview' && (
          <EventOverviewTab event={event} />
        )}
        
        {activeTab === 'Monitoring' && (
          <EventMonitoringTab event={event} />
        )}
        
        {activeTab === 'Zones' && (
          <div className="h-[500px]">
            <CrowdHeatmapView event={event} />
          </div>
        )}
        
        {activeTab === 'Safety' && (
          <EventSafetyTab event={event} />
        )}
        
        {activeTab === 'Audit Log' && (
          <EventAuditLogTab event={event} />
        )}

        {activeTab === 'Cameras' && (
          <EventCamerasTab event={event} />
        )}

        {activeTab !== 'Overview' && activeTab !== 'Monitoring' && activeTab !== 'Zones' && activeTab !== 'Safety' && activeTab !== 'Audit Log' && activeTab !== 'Cameras' && (
          <div className="p-8 text-center text-slate-500 border border-dashed border-[#1a2334] rounded-xl bg-[#0a0d14]/50">
            {activeTab} view pending implementation...
          </div>
        )}
      </div>
      
    </div>
  );
}
