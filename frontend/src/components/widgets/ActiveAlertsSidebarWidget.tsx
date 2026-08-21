'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { alertsApi, Alert } from '@/lib/services';
import { useEventWebSocket } from '@/hooks/events/useEventWebSocket';
import { useApiState } from '@/hooks/useApiState';
import { ApiStateBoundary } from '@/components/ui/ApiStateBoundary';

interface ActiveAlertsSidebarWidgetProps {
  eventId?: string;
}

export const ActiveAlertsSidebarWidget: React.FC<ActiveAlertsSidebarWidgetProps> = ({ eventId }) => {
  const { data: alerts, isLoading, error, isEmpty, isOffline, execute, retry, setData } = useApiState<Alert[]>(
    async () => {
      const data = eventId ? await alertsApi.getEventAlerts(eventId) : await alertsApi.getAlerts();
      const sorted = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return sorted.slice(0, 4);
    },
    { executeOnMount: true }
  );

  // Real-time hook for a specific event
  const { latestAlert } = useEventWebSocket(eventId || '');

  // Real-time zero-polling append
  useEffect(() => {
    if (latestAlert) {
      setData((prev: Alert[] | null) => {
        const safePrev = prev || [];
        // Prevent duplicates
        if (safePrev.some((a: Alert) => a.id === latestAlert.id)) return safePrev;
        
        const newAlerts = [latestAlert, ...safePrev];
        return newAlerts.slice(0, 4);
      });
    }
  }, [latestAlert, setData]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAlertStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          containerClass: 'bg-[#210f13] border-red-500/50',
          badgeClass: 'bg-red-500 text-white',
          iconColor: 'text-red-400',
          icon: AlertTriangle
        };
      case 'HIGH':
        return {
          containerClass: 'bg-[#221610] border-orange-500/40',
          badgeClass: 'bg-orange-500 text-white',
          iconColor: 'text-orange-400',
          icon: AlertTriangle
        };
      case 'MEDIUM':
      default:
        return {
          containerClass: 'bg-[#1e1b12] border-yellow-500/40',
          badgeClass: 'bg-yellow-500 text-black',
          iconColor: 'text-yellow-400',
          icon: AlertCircle
        };
    }
  };

  return (
    <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-3.5 flex flex-col justify-between shadow-sm hover:border-[#25334c] transition-all h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#182130]">
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm font-bold text-white tracking-wide flex items-center gap-2">
            Active Alerts
            <span className="bg-[#ef4444] text-white px-1.5 py-0.5 rounded-full text-[10px]">{alerts?.length || 0}</span>
          </span>
          {eventId && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-900/40 text-blue-400 text-[9px] font-bold tracking-wider uppercase">
              LIVE
            </span>
          )}
        </div>
        <a href={eventId ? `/dashboard/events/${eventId}/report` : "/dashboard/alerts-risks"} className="text-xs font-semibold text-[#f95738] hover:underline">
          View All
        </a>
      </div>

      {/* Alert Items List */}
      <div className="space-y-2 my-2 flex-grow overflow-y-auto min-h-[200px]">
        <ApiStateBoundary
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          isOffline={isOffline}
          onRetry={retry}
          loadingMessage="Fetching active alerts..."
          emptyMessage="No active alerts."
        >
          {alerts?.map((alert) => {
            const styles = getAlertStyles(alert.severity);
            const Icon = styles.icon;

            return (
              <div
                key={alert.id}
                className={`p-2.5 rounded-lg border flex items-start justify-between gap-2.5 transition-all hover:scale-[1.01] ${styles.containerClass}`}
              >
                <div className="flex items-start gap-2 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${styles.iconColor}`} />

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase tracking-wide ${styles.badgeClass}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {alert.location}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5 truncate">
                      {alert.message}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap mt-0.5">
                  {formatTime(alert.timestamp)}
                </span>
              </div>
            );
          })}
        </ApiStateBoundary>
      </div>
    </div>
  );
};
