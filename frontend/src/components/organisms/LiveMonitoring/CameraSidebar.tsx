'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export interface CameraListProps {
  id: string;
  name: string;
  status: 'live' | 'offline' | 'recording';
  zone: string;
}

interface CameraSidebarProps {
  cameras: CameraListProps[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCameraId?: string | null;
  onSelectCamera: (id: string) => void;
}

export const CameraSidebar: React.FC<CameraSidebarProps> = ({
  cameras,
  searchQuery,
  onSearchChange,
  selectedCameraId,
  onSelectCamera
}) => {
  return (
    <div className="w-64 border-l border-border/50 bg-card/30 flex flex-col h-full">
      <div className="p-4 border-b border-border/50 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">Cameras</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Search cameras..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 h-8 text-xs bg-background/50 border-border/50 focus-visible:ring-primary focus-visible:ring-offset-0"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
        {cameras.map((cam) => {
          const isSelected = selectedCameraId === cam.id;
          return (
            <button
              key={cam.id}
              onClick={() => onSelectCamera(cam.id)}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between transition-colors ${
                isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className={`text-xs font-medium truncate pr-2 ${isSelected ? 'text-primary' : 'text-foreground/80'}`}>
                {cam.name}
              </span>
              <span className={`shrink-0 w-2 h-2 rounded-full ${cam.status === 'live' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-muted-foreground'}`} />
            </button>
          );
        })}
      </div>
      
      <div className="p-3 border-t border-border/50 text-center">
        <button className="text-[10px] font-semibold text-primary hover:underline">
          View all
        </button>
      </div>
    </div>
  );
};
