'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableCardProps {
  title: string;
  columns: TableColumn[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  delay?: number;
}

export const DataTableCard: React.FC<DataTableCardProps> = React.memo(({
  title,
  columns,
  data,
  delay = 0,
}) => {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={delay * 10} className="h-full flex flex-col">
      <Card className="flex flex-col h-full flex-1 shadow-sm">
        <CardHeader className="p-4 pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-card/50">
                {columns.map((col) => (
                  <th key={col.key} className={`p-3 text-xs font-semibold text-muted-foreground ${col.width ? `w-[${col.width}]` : ''} text-${col.align || 'left'}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <motion.tr 
                  key={row.id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (delay * 0.1) + (i * 0.05) }}
                  className="border-b border-border/20 hover:bg-white/5 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={`${row.id}-${col.key}`} className={`p-3 text-xs text-foreground/80 text-${col.align || 'left'}`}>
                      {row[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
});

DataTableCard.displayName = 'DataTableCard';
