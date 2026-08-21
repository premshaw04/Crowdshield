'use client';

import React from 'react';
import { Loader2, WifiOff, AlertTriangle, ShieldAlert, FileWarning, RefreshCw, LogIn } from 'lucide-react';
import { APIError } from '@/lib/api/errors';
import Link from 'next/link';

interface ApiStateBoundaryProps {
  isLoading: boolean;
  error: APIError | null;
  isEmpty: boolean;
  isOffline: boolean;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyMessage?: string;
  children: React.ReactNode;
}

export const ApiStateBoundary: React.FC<ApiStateBoundaryProps> = ({
  isLoading,
  error,
  isEmpty,
  isOffline,
  onRetry,
  loadingMessage = 'Loading data...',
  emptyMessage = 'No data available.',
  children
}) => {

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full min-h-[150px] w-full bg-black/10 rounded-lg border border-white/5">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3 opacity-80" />
        <span className="text-sm font-medium text-muted-foreground">{loadingMessage}</span>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full min-h-[150px] w-full bg-red-950/10 rounded-lg border border-red-900/20 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
          <WifiOff className="w-6 h-6 text-red-500 opacity-80" />
        </div>
        <h3 className="text-base font-bold text-red-400 mb-1">Network Offline</h3>
        <p className="text-xs text-slate-400 mb-4 max-w-[250px]">
          Unable to reach the server. Please check your internet connection.
        </p>
        {onRetry && (
          <button onClick={onRetry} className="flex items-center gap-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors shadow-sm">
            <RefreshCw size={12} /> Retry Connection
          </button>
        )}
      </div>
    );
  }

  if (error) {
    // 401 Unauthorized
    if (error.status === 401) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-full min-h-[150px] w-full bg-amber-950/10 rounded-lg border border-amber-900/20 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6 text-amber-500 opacity-80" />
          </div>
          <h3 className="text-base font-bold text-amber-400 mb-1">Session Expired</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-[250px]">
            Your authentication session has expired. Please log in again to continue.
          </p>
          <Link href="/login" className="flex items-center gap-2 text-xs font-bold text-amber-950 bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-md transition-colors shadow-sm">
            <LogIn size={12} /> Return to Login
          </Link>
        </div>
      );
    }
    
    // 403 Forbidden
    if (error.status === 403) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-full min-h-[150px] w-full bg-purple-950/10 rounded-lg border border-purple-900/20 text-center">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6 text-purple-500 opacity-80" />
          </div>
          <h3 className="text-base font-bold text-purple-400 mb-1">Access Denied</h3>
          <p className="text-xs text-slate-400 max-w-[250px]">
            You do not have the required permissions to view this resource.
          </p>
        </div>
      );
    }

    // Generic API Error
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full min-h-[150px] w-full bg-red-950/5 rounded-lg border border-red-900/20 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6 text-red-500 opacity-80" />
        </div>
        <h3 className="text-base font-bold text-red-400 mb-1">System Failure</h3>
        <p className="text-xs text-slate-400 mb-2 max-w-[300px]">
          {error.message || 'An unexpected error occurred while fetching data.'}
        </p>
        {error.requestId && (
          <div className="text-[10px] font-mono text-slate-500 mb-4 bg-black/40 px-2 py-1 rounded">
            Req ID: {error.requestId}
          </div>
        )}
        {onRetry && (
          <button onClick={onRetry} className="flex items-center gap-2 text-xs font-bold text-white bg-[#1e293b] hover:bg-[#334155] border border-slate-700 px-4 py-2 rounded-md transition-colors shadow-sm mt-2">
            <RefreshCw size={12} /> Try Again
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full min-h-[150px] w-full bg-black/10 rounded-lg border border-white/5 text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
          <FileWarning className="w-6 h-6 text-slate-500 opacity-80" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300 mb-1">{emptyMessage}</h3>
        <p className="text-xs text-slate-500">
          No records match the current criteria.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
