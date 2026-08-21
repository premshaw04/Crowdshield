'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

export interface GaugeCardProps {
  title: string;
  value: number; // 0-100
  label: string;
  sublabel?: string;
  colorClass?: string; // e.g. 'text-red-500'
  strokeColor?: string; // e.g. '#ef4444'
  delay?: number;
}

export const GaugeCard: React.FC<GaugeCardProps> = React.memo(({
  title,
  value,
  label,
  sublabel,
  colorClass = 'text-primary',
  strokeColor = '#ef4444',
  delay = 0,
}) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={delay * 10} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 shadow-sm">
        <CardHeader className="p-4 pb-0 border-none relative z-10">
          <CardTitle className="text-sm font-semibold text-foreground text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col items-center justify-center relative">
          
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90 absolute inset-0">
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-border/50"
                strokeWidth="8"
                fill="none"
              />
              {/* Animated Progress Circle */}
              <motion.circle
                cx="64"
                cy="64"
                r={radius}
                stroke={strokeColor}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut", delay: delay * 0.1 }}
                style={{ filter: `drop-shadow(0 0 6px ${strokeColor}80)` }}
              />
            </svg>
            
            {/* Center Text */}
            <div className="flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${colorClass}`}>
                {value}%
              </span>
            </div>
          </div>
          
          <div className="mt-4 text-center">
             <div className={`text-sm font-semibold ${colorClass}`}>{label}</div>
             {sublabel && <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{sublabel}</div>}
          </div>
          
        </CardContent>
      </Card>
    </motion.div>
  );
});

GaugeCard.displayName = 'GaugeCard';
