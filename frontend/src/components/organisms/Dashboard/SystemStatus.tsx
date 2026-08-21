'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

export const SystemStatus = React.memo(() => {
  const systems = [
    { label: 'Cameras', value: '118 / 120', status: 'Online', statusColor: 'text-green-500' },
    { label: 'IoT Sensors', value: '58 / 64', status: 'Online', statusColor: 'text-green-500' },
    { label: 'Mobile Users', value: '3,281', status: 'Active', statusColor: 'text-green-500' },
    { label: 'Server Health', value: '98.7%', status: 'Stable', statusColor: 'text-muted-foreground' },
  ];

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={6} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 shadow-sm">
        <CardHeader className="p-4 pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold text-foreground">System Status</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 space-y-4">
          {systems.map((sys, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{sys.label}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">{sys.value}</span>
                <span className={`text-[10px] w-10 text-right uppercase tracking-wider font-semibold ${sys.statusColor}`}>{sys.status}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
});

SystemStatus.displayName = 'SystemStatus';
