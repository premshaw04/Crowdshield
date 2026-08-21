'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { scaleIn } from '@/lib/animations';

export interface CameraCardProps {
  title?: string;
  location: string;
  status?: 'live' | 'offline' | 'error';
  streamUrl?: string;
  delay?: number;
}

export const CameraCard: React.FC<CameraCardProps> = React.memo(({
  title = "Camera Feed",
  location,
  status = 'live',
  delay = 0,
}) => {
  return (
    <motion.div variants={scaleIn} initial="hidden" animate="visible" custom={delay * 10} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-border/50 bg-black/20 relative z-20">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className="text-foreground flex items-center gap-2">
              {status === 'live' ? (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              )}
              {title}
            </span>
            <span className="text-xs text-muted-foreground font-medium bg-background/50 backdrop-blur-sm px-2 py-1 rounded-md">{location}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 relative bg-black/40 group cursor-pointer min-h-[200px]">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground z-10">
            {status === 'live' ? (
              <>
                <Video className="h-10 w-10 opacity-30 mb-3 group-hover:scale-110 transition-transform group-hover:opacity-100 group-hover:text-primary duration-300" />
                <span className="text-xs font-medium tracking-wide">Click to Connect Stream</span>
              </>
            ) : (
              <>
                <WifiOff className="h-10 w-10 opacity-30 mb-3" />
                <span className="text-xs font-medium tracking-wide">Camera Offline</span>
              </>
            )}
          </div>
          {status === 'live' && (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80" />
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

CameraCard.displayName = 'CameraCard';
