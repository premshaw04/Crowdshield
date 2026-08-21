'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

export interface NotificationCardProps {
  title: string;
  message: string | React.ReactNode;
  timestamp?: string;
  badgeText?: string;
  badgeColor?: string; // e.g. 'text-green-500'
  delay?: number;
}

export const NotificationCard: React.FC<NotificationCardProps> = React.memo(({
  title,
  message,
  timestamp,
  badgeText,
  badgeColor = 'text-primary',
  delay = 0,
}) => {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={delay * 10} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 shadow-sm">
        <CardHeader className="p-4 pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col justify-center">
          <p className="text-xs text-foreground/90 leading-relaxed mb-3">
            {message}
          </p>
          <div className="flex justify-between items-center text-[10px]">
            {timestamp && <span className="text-muted-foreground">{timestamp}</span>}
            {badgeText && <span className={`font-bold uppercase tracking-wider ${badgeColor}`}>{badgeText}</span>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

NotificationCard.displayName = 'NotificationCard';
