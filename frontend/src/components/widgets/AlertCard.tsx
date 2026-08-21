'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

export interface AlertItem {
  id?: string | number;
  time: string;
  message: string;
  level: 'High' | 'Medium' | 'Low' | 'Critical';
}

export interface AlertCardProps {
  title?: string;
  alerts: AlertItem[];
  delay?: number;
  onViewAll?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = React.memo(({
  title = "Recent Alerts",
  alerts,
  delay = 0,
  onViewAll
}) => {
  const levelColors = {
    Critical: 'text-red-600',
    High: 'text-red-500',
    Medium: 'text-yellow-500',
    Low: 'text-green-500',
  };

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={delay * 10} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 shadow-sm">
        <CardHeader className="p-4 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
          {onViewAll && (
            <button 
              onClick={onViewAll} 
              className="text-[11px] text-primary cursor-pointer hover:underline font-medium bg-transparent border-0 p-0"
              aria-label={`View all ${title}`}
            >
              View all
            </button>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-1 space-y-4 overflow-y-auto">
          {alerts.map((alert, i) => (
            <div key={alert.id || i} className="flex gap-4 items-start">
              <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5 w-12">{alert.time}</span>
              <div className="flex-1 flex justify-between items-start gap-4">
                <span className="text-xs text-foreground/80 leading-relaxed">{alert.message}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${levelColors[alert.level]}`}>{alert.level}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
});

AlertCard.displayName = 'AlertCard';
