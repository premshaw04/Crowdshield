'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { Unlock, Lock, LogOut, Loader2 } from 'lucide-react';
import { gatesApi, Gate, GateStatus } from '@/lib/services';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

export default function GateControlPage() {
  const [gates, setGates] = useState<Gate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dialogConfig, setDialogConfig] = useState<{ isOpen: boolean; gate: Gate | null; action: 'Open' | 'Closed' | null }>({ isOpen: false, gate: null, action: null });
  const [processingGateId, setProcessingGateId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGates = async () => {
      setIsLoading(true);
      try {
        const data = await gatesApi.getGates();
        setGates(data);
      } catch (err) {
        console.error('Failed to fetch gates', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGates();
  }, []);

  const handleGateClick = (gate: Gate) => {
    if (processingGateId === gate.id) return;
    
    // Determine target action based on current status
    const targetAction = gate.status === 'Closed' ? 'Open' : 'Closed';
    
    // Exit Only gates shouldn't be toggled normally in this basic UI unless authorized, but for demo we will allow it
    if (gate.status === 'Exit Only') {
      alert("This gate is in Exit Only mode. Manual override required.");
      return;
    }

    setDialogConfig({ isOpen: true, gate, action: targetAction });
  };

  const confirmAction = async () => {
    const { gate, action } = dialogConfig;
    if (!gate || !action) return;

    setProcessingGateId(gate.id);
    
    try {
      let updatedGate: Gate;
      if (action === 'Open') {
        updatedGate = await gatesApi.openGate(gate.id);
      } else {
        updatedGate = await gatesApi.closeGate(gate.id);
      }
      
      setGates(prev => prev.map(g => g.id === gate.id ? updatedGate : g));
      setDialogConfig({ isOpen: false, gate: null, action: null });
    } catch (err) {
      console.error(`Failed to ${action} gate`, err);
    } finally {
      setProcessingGateId(null);
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'Open': return <Unlock size={14} className="text-green-500" />;
      case 'Closed': return <Lock size={14} className="text-red-500" />;
      case 'Exit Only': return <LogOut size={14} className="text-orange-500" />;
      default: return null;
    }
  };

  const getColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-green-500';
      case 'Closed': return 'text-red-500';
      case 'Exit Only': return 'text-orange-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      
      <ConfirmationDialog
        isOpen={dialogConfig.isOpen}
        title={`${dialogConfig.action} ${dialogConfig.gate?.name}`}
        message={`Are you sure you want to ${dialogConfig.action?.toLowerCase()} ${dialogConfig.gate?.name}? This is an operational action.`}
        confirmText={`Confirm ${dialogConfig.action}`}
        intent={dialogConfig.action === 'Closed' ? 'danger' : 'primary'}
        isProcessing={processingGateId === dialogConfig.gate?.id}
        onConfirm={confirmAction}
        onCancel={() => {
          if (processingGateId !== dialogConfig.gate?.id) {
            setDialogConfig({ isOpen: false, gate: null, action: null });
          }
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between bg-card/30 p-4 rounded-lg border border-border/50">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            Gate Control
            {isLoading && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
          </h1>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
             <button className="text-primary hover:text-primary/80 border-b border-primary pb-1">All Gates</button>
             <button className="hover:text-foreground pb-1">Entry Gates</button>
             <button className="hover:text-foreground pb-1">Exit Gates</button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gates.map((gate, i) => (
          <motion.div key={gate.id} variants={fadeInUp} initial="hidden" animate="visible" custom={i}>
            <Card 
              onClick={() => handleGateClick(gate)}
              className={`bg-card/40 border border-border/50 transition-all ${
                processingGateId === gate.id ? 'opacity-50 cursor-wait' : 'hover:bg-white/5 hover:border-primary/50 cursor-pointer'
              }`}
            >
              <CardContent className="p-4 flex flex-col justify-between h-[120px] relative">
                {processingGateId === gate.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl z-10 backdrop-blur-[1px]">
                    <Loader2 className="animate-spin text-primary" size={24} />
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{gate.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{gate.type}</div>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5">
                    {getIcon(gate.status)}
                  </div>
                </div>
                <div>
                  <div className={`text-xl font-bold ${getColor(gate.status)} flex items-center gap-2`}>
                    {gate.status === 'Closed' && <span className="animate-pulse w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                    {gate.status}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Global Actions */}
      <div className="flex gap-4 pt-4">
        <button className="flex-1 bg-black/40 hover:bg-white/5 border border-white/10 text-foreground py-3 rounded-lg font-semibold transition-colors">
          Open All
        </button>
        <button className="flex-1 bg-black/40 hover:bg-white/5 border border-white/10 text-foreground py-3 rounded-lg font-semibold transition-colors">
          Close All
        </button>
        <button className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 py-3 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          ⚠ Emergency Open
        </button>
      </div>

    </div>
  );
}
