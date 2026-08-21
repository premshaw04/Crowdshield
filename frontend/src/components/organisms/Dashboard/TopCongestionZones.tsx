'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

export const TopCongestionZones = React.memo(() => {
  const zones = [
    { id: 1, name: 'Food Court', density: '9.2', status: 'critical' },
    { id: 2, name: 'Main Entrance', density: '7.8', status: 'high' },
    { id: 3, name: 'Fashion Zone', density: '6.1', status: 'medium' },
    { id: 4, name: 'Parking Area', density: '2.3', status: 'low' },
  ];

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={4} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 shadow-sm">
        <CardHeader className="p-4 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">Top Congested Zones</CardTitle>
          <button className="text-[11px] text-primary bg-transparent border-0 p-0 cursor-pointer hover:underline font-medium">View all</button>
        </CardHeader>
        <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto">
          {zones.map((zone, i) => (
            <motion.div 
              key={zone.id} 
              variants={fadeInUp} 
              initial="hidden" 
              animate="visible" 
              custom={5 + i}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-background/50 text-xs text-muted-foreground font-medium group-hover:bg-primary/20 group-hover:text-primary transition-colors">{zone.id}</span>
                <span className="text-sm text-foreground/90 font-medium">{zone.name}</span>
              </div>
              <div className={`text-sm font-semibold ${zone.status === 'critical' || zone.status === 'high' ? 'text-red-500' : 'text-yellow-500'}`}>
                {zone.density} <span className="text-[10px] opacity-70 font-normal">people/m²</span>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
});

TopCongestionZones.displayName = 'TopCongestionZones';
