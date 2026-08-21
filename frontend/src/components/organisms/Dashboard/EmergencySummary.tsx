'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

export const EmergencySummary = React.memo(() => {
  const emergencies = [
    { label: 'SOS', count: 3, color: 'text-red-500' },
    { label: 'Medical', count: 1, color: 'text-red-500' },
    { label: 'Fire', count: 0, color: 'text-orange-500' },
    { label: 'Fight', count: 2, color: 'text-red-500' },
    { label: 'Other', count: 1, color: 'text-muted-foreground' },
  ];

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={3} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 shadow-sm">
        <CardHeader className="p-4 pb-2 border-b border-border/50">
          <CardTitle className="text-sm font-semibold text-foreground">Emergency Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex justify-between items-center min-h-[100px]">
          {emergencies.map((em, i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-2">
              <span className={`text-xs font-semibold uppercase tracking-wider ${em.color}`}>
                {em.label}
              </span>
              <span className={`text-3xl font-bold ${em.count > 0 ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>
                {em.count}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
});

EmergencySummary.displayName = 'EmergencySummary';
