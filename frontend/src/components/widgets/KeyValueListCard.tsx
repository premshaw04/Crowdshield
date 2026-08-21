'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

export interface KeyValueItem {
  label: string;
  value: string | number;
  statusText?: string;
  statusColor?: string; // e.g., 'text-green-500'
}

export interface KeyValueListCardProps {
  title: string;
  items: KeyValueItem[];
  delay?: number;
}

export const KeyValueListCard: React.FC<KeyValueListCardProps> = React.memo(({
  title,
  items,
  delay = 0,
}) => {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={delay * 10} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 shadow-sm">
        <CardHeader className="p-4 pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 space-y-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">{item.value}</span>
                {item.statusText && (
                  <span className={`text-[10px] w-10 text-right uppercase tracking-wider font-semibold ${item.statusColor || 'text-muted-foreground'}`}>
                    {item.statusText}
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
});

KeyValueListCard.displayName = 'KeyValueListCard';
