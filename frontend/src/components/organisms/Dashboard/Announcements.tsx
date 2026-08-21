'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

export const Announcements = React.memo(() => {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={7} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 shadow-sm">
        <CardHeader className="p-4 pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold text-foreground">Announcements</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col justify-center">
          <p className="text-xs text-foreground/90 leading-relaxed mb-3">
            Food Court is crowded.<br/>
            Please proceed to West Wing.
          </p>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-muted-foreground">Broadcasted 11:35 AM</span>
            <span className="text-green-500 font-bold uppercase tracking-wider">Active</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

Announcements.displayName = 'Announcements';
