'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { scaleIn } from '@/lib/animations';
import { Loading } from '@/components/ui/loading';

const Map = dynamic(() => import('../maps/Map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background border border-border rounded-b-lg">
      <Loading text="Loading Map..." size={16} />
    </div>
  )
});

export interface HeatmapCardProps {
  title?: string;
  delay?: number;
  showLegend?: boolean;
}

export const HeatmapCard: React.FC<HeatmapCardProps> = React.memo(({
  title = "Crowd Heatmap",
  delay = 0,
  showLegend = true,
}) => {
  return (
    <motion.div variants={scaleIn} initial="hidden" animate="visible" custom={delay * 10} className="h-full w-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 w-full overflow-hidden">
        {title && (
          <CardHeader className="p-4 pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-0 flex-1 relative min-h-[250px]">
           <Map />
           
           {showLegend && (
             <div className="absolute right-4 bottom-4 z-[1000] bg-background/80 backdrop-blur-sm border border-border p-2 rounded-md flex flex-col gap-2 shadow-sm">
               <div className="text-[10px] text-foreground/70 font-semibold uppercase tracking-wider text-center">Density</div>
               <div className="w-2 h-24 rounded-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 mx-auto" />
               <div className="flex justify-between text-[9px] text-muted-foreground w-full px-1">
                 <span>Low</span>
                 <span>High</span>
               </div>
             </div>
           )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

HeatmapCard.displayName = 'HeatmapCard';
