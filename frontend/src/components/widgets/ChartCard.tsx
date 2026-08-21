'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  primaryValue?: string | number;
  primaryLabel?: string;
  secondaryValue?: string;
  secondaryLabel?: string;
  valueColor?: string;
  delay?: number;
}

export const ChartCard: React.FC<ChartCardProps> = React.memo(({
  title,
  subtitle,
  data,
  options,
  primaryValue,
  primaryLabel,
  secondaryValue,
  secondaryLabel,
  valueColor = 'text-red-500',
  delay = 0,
}) => {
  const defaultOptions = useMemo<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: { grid: { display: false, drawOnChartArea: false }, ticks: { color: '#64748B', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)', drawOnChartArea: false }, ticks: { color: '#64748B', font: { size: 10 }, maxTicksLimit: 5 }, beginAtZero: true },
    },
    elements: { line: { tension: 0.4 }, point: { radius: 0, hitRadius: 10, hoverRadius: 4 } },
  }), []);

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={delay * 10} className="h-full flex flex-col">
      <Card className="h-full flex flex-col flex-1">
        <CardHeader className="p-4 pb-0 border-b border-border/50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">
            {title} {subtitle && <span className="text-muted-foreground font-normal ml-1">{subtitle}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col relative min-h-[200px]">
          {primaryValue && (
            <div className="absolute right-4 top-4 text-right z-10">
              <div className={`text-3xl font-bold ${valueColor}`}>{primaryValue}</div>
              {primaryLabel && <div className={`text-[10px] font-semibold uppercase tracking-wider ${valueColor} opacity-80`}>{primaryLabel}</div>}
              {secondaryLabel && <div className="text-xs text-muted-foreground mt-1">{secondaryLabel}</div>}
              {secondaryValue && <div className="text-sm font-semibold text-foreground">{secondaryValue}</div>}
            </div>
          )}
          <div className="flex-1 w-full h-full relative mt-4">
            <Line options={options || defaultOptions} data={data} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ChartCard.displayName = 'ChartCard';
