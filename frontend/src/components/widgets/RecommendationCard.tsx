'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';

export interface RecommendationItem {
  id?: string | number;
  title: string;
  desc: string;
  impact: 'High Impact' | 'Medium Impact' | 'Low Impact';
  actionLabel?: string;
  onAction?: () => void;
}

export interface RecommendationCardProps {
  title?: string;
  updatedAt?: string;
  recommendations: RecommendationItem[];
  delay?: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = React.memo(({
  title = "Recommendations",
  updatedAt,
  recommendations,
  delay = 0,
}) => {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={delay * 10} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 shadow-sm">
        <CardHeader className="p-4 pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold text-foreground flex justify-between items-center">
            <span>{title}</span>
            {updatedAt && <span className="text-[10px] text-muted-foreground font-normal bg-background/50 px-2 py-0.5 rounded">{updatedAt}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-3">
            {recommendations.map((rec, i) => {
              const isHigh = rec.impact === 'High Impact';
              return (
                <motion.div 
                  key={rec.id || i} 
                  variants={fadeInUp}
                  className="flex items-start justify-between p-3 rounded-lg bg-background/30 border border-border/50 hover:bg-background/50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shadow-[0_0_8px_currentColor] ${isHigh ? 'bg-red-500 text-red-500' : 'bg-yellow-500 text-yellow-500'}`} />
                    <div>
                      <div className="text-sm font-semibold text-foreground/90">{rec.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{rec.desc}</div>
                      <div className={`text-[10px] font-medium mt-1.5 flex items-center gap-1.5 ${isHigh ? 'text-red-500' : 'text-yellow-500'}`}>
                        <div className="w-1 h-1 rounded-full bg-current opacity-70"></div>
                        {rec.impact}
                      </div>
                    </div>
                  </div>
                  {rec.actionLabel && (
                    <button 
                      onClick={rec.onAction}
                      aria-label={`${rec.actionLabel} ${rec.title}`}
                      className="text-[11px] font-semibold text-primary hover:text-white px-3 py-1.5 rounded bg-primary/10 hover:bg-primary/80 hover:shadow-[0_0_12px_rgba(147,51,234,0.4)] transition-all active:scale-95"
                    >
                      {rec.actionLabel}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

RecommendationCard.displayName = 'RecommendationCard';
