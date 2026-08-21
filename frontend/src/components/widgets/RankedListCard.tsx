'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

export interface RankedItem {
  id: string | number;
  name: string;
  value: string | number;
  unit?: string;
  highlightLevel?: 'critical' | 'high' | 'medium' | 'low';
}

export interface RankedListCardProps {
  title: string;
  items: RankedItem[];
  delay?: number;
  onViewAll?: () => void;
}

export const RankedListCard: React.FC<RankedListCardProps> = React.memo(({
  title,
  items,
  delay = 0,
  onViewAll
}) => {
  const getHighlightColor = (level?: string) => {
    switch (level) {
      case 'critical':
      case 'high': return 'text-destructive';
      case 'medium': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={delay * 10} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 shadow-sm">
        <CardHeader className="p-4 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-[11px] text-primary bg-transparent border-0 p-0 cursor-pointer hover:underline font-medium"
            >
              View all
            </button>
          )}
        </CardHeader>
        <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto">
          {items.map((item, i) => (
            <motion.div 
              key={item.id} 
              variants={fadeInUp} 
              initial="hidden" 
              animate="visible" 
              custom={(delay * 10) + 1 + i}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-background/50 text-xs text-muted-foreground font-medium group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground/90 font-medium">{item.name}</span>
              </div>
              <div className={`text-sm font-semibold ${getHighlightColor(item.highlightLevel)}`}>
                {item.value} {item.unit && <span className="text-[10px] opacity-70 font-normal">{item.unit}</span>}
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
});

RankedListCard.displayName = 'RankedListCard';
