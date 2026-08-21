'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

export interface StatGridItem {
  label: string;
  count: number;
  color?: string; // Tailwind text color class, e.g. 'text-red-500'
}

export interface StatGridCardProps {
  title: string;
  items: StatGridItem[];
  delay?: number;
}

export const StatGridCard: React.FC<StatGridCardProps> = React.memo(({
  title,
  items,
  delay = 0,
}) => {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={delay * 10} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 shadow-sm">
        <CardHeader className="p-4 pb-2 border-b border-border/50">
          <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex justify-between items-center min-h-[100px]">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-2">
              <span className={`text-xs font-semibold uppercase tracking-wider ${item.color || 'text-foreground'}`}>
                {item.label}
              </span>
              <span className={`text-3xl font-bold ${item.count > 0 ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>
                {item.count}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
});

StatGridCard.displayName = 'StatGridCard';
