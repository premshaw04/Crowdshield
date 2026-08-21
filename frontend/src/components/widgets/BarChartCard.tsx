'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { scaleIn } from '@/lib/animations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface BarChartCardProps {
  title: string;
  subtitle?: string;
  data: ChartData<'bar'>;
  primaryValue?: string;
  primaryLabel?: string;
  valueColor?: string;
  delay?: number;
}

export const BarChartCard: React.FC<BarChartCardProps> = React.memo(({
  title,
  subtitle,
  data,
  primaryValue,
  primaryLabel,
  valueColor = 'text-foreground',
  delay = 0,
}) => {
  const options: ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10,
          },
          maxTicksLimit: 5,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }), []);

  return (
    <motion.div variants={scaleIn} initial="hidden" animate="visible" custom={delay * 10} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 shadow-sm">
        <CardHeader className="p-4 pb-0 border-none">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                {title} {subtitle && <span className="text-[10px] text-muted-foreground font-normal">{subtitle}</span>}
              </CardTitle>
            </div>
            {primaryValue && (
              <div className="text-right">
                <div className={`text-2xl font-bold ${valueColor}`}>{primaryValue}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{primaryLabel}</div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-1 w-full min-h-[200px] relative">
          <Bar options={options} data={data} />
        </CardContent>
      </Card>
    </motion.div>
  );
});

BarChartCard.displayName = 'BarChartCard';
