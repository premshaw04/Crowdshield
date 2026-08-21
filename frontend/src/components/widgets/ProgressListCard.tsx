'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

export interface ProgressItem {
  id: string | number;
  label: string;
  value: number; // 0-100
  valueText?: string; // Optional text to show instead of just "XX%" e.g., "92% Very High Risk"
  colorClass?: string; // Tailwind bg class for the progress bar, e.g., 'bg-red-500'
}

export interface ProgressListCardProps {
  title: string;
  items: ProgressItem[];
  delay?: number;
}

export const ProgressListCard: React.FC<ProgressListCardProps> = React.memo(({
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
        <CardContent className="p-4 space-y-5 flex-1 overflow-y-auto">
          {items.map((item, i) => (
            <motion.div 
              key={item.id}
              variants={fadeInUp} 
              initial="hidden" 
              animate="visible" 
              custom={(delay * 10) + 1 + i}
              className="space-y-1.5"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/90 font-medium">{item.label}</span>
                <span className={`font-semibold ${item.colorClass ? item.colorClass.replace('bg-', 'text-') : 'text-foreground'}`}>
                  {item.valueText || `${item.value}%`}
                </span>
              </div>
              <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: (delay * 0.1) + 0.3 }}
                  className={`h-full rounded-full ${item.colorClass || 'bg-primary'}`}
                />
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
});

ProgressListCard.displayName = 'ProgressListCard';
