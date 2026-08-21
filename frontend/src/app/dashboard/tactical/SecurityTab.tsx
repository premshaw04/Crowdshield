'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { MapPin, Loader2, X, Plus } from 'lucide-react';
import { securityApi, SecurityDeployment } from '@/lib/services';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

export default function SecurityDeploymentPage() {
  const [deployments, setDeployments] = useState<SecurityDeployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [cancelConfig, setCancelConfig] = useState<{ isOpen: boolean; dep: SecurityDeployment | null }>({ isOpen: false, dep: null });
  const [deployConfig, setDeployConfig] = useState<{ isOpen: boolean; zone: string; staffCount: number }>({ isOpen: false, zone: 'Main Entrance', staffCount: 5 });
  
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeployments = async () => {
      setIsLoading(true);
      try {
        const data = await securityApi.getDeployments();
        setDeployments(data);
      } catch (err) {
        console.error('Failed to fetch deployments', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeployments();
  }, []);

  const handleCancelDeployment = async () => {
    const { dep } = cancelConfig;
    if (!dep) return;

    setProcessingId(dep.id);
    try {
      const updated = await securityApi.cancelDeployment(dep.id);
      setDeployments(prev => prev.map(d => d.id === dep.id ? updated : d));
      setCancelConfig({ isOpen: false, dep: null });
    } catch (err) {
      console.error('Failed to cancel deployment', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeployStaff = async () => {
    setProcessingId('new_deployment');
    try {
      const newDep = await securityApi.deploySecurity({
        zone: deployConfig.zone,
        staffCount: deployConfig.staffCount
      });
      setDeployments(prev => [newDep, ...prev]);
      setDeployConfig({ ...deployConfig, isOpen: false });
    } catch (err) {
      console.error('Failed to deploy security', err);
    } finally {
      setProcessingId(null);
    }
  };

  const mapMarkers = [
    { top: '30%', left: '20%' },
    { top: '45%', left: '35%' },
    { top: '20%', left: '60%' },
    { top: '60%', left: '70%' },
    { top: '75%', left: '40%' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 h-[calc(100vh-8rem)] min-h-[600px] flex flex-col">
      
      {/* Cancel Dialog */}
      <ConfirmationDialog
        isOpen={cancelConfig.isOpen}
        title="Cancel Deployment"
        message={`Are you sure you want to cancel the deployment of ${cancelConfig.dep?.staffCount} staff at ${cancelConfig.dep?.zone}?`}
        confirmText="Confirm Recall"
        intent="danger"
        isProcessing={processingId === cancelConfig.dep?.id}
        onConfirm={handleCancelDeployment}
        onCancel={() => {
          if (processingId !== cancelConfig.dep?.id) {
            setCancelConfig({ isOpen: false, dep: null });
          }
        }}
      />

      {/* Deploy Dialog (using ConfirmationDialog as a base wrapper for simplicity, though a custom modal is better) */}
      <ConfirmationDialog
        isOpen={deployConfig.isOpen}
        title="Deploy New Security Personnel"
        message={`This will dispatch ${deployConfig.staffCount} new security officers to ${deployConfig.zone}. Confirm deployment?`}
        confirmText="Dispatch Units"
        intent="primary"
        isProcessing={processingId === 'new_deployment'}
        onConfirm={handleDeployStaff}
        onCancel={() => {
          if (processingId !== 'new_deployment') {
            setDeployConfig({ ...deployConfig, isOpen: false });
          }
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between bg-card/30 p-4 rounded-lg border border-border/50">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            Security Deployment
            {isLoading && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
          </h1>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left: Map */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="lg:col-span-8 flex flex-col">
          <Card className="flex-1 bg-card/40 border border-border/50 relative overflow-hidden">
            <CardHeader className="p-4 pb-0 z-10 relative">
              <CardTitle className="text-sm font-semibold text-foreground">Live Personnel Map</CardTitle>
            </CardHeader>
            <CardContent className="absolute inset-0 p-0 flex items-center justify-center pt-10">
               <div className="w-[80%] h-[80%] bg-black/60 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                 <div className="text-muted-foreground/30 font-bold text-4xl tracking-widest uppercase">Floorplan Blueprint</div>
                 
                 {mapMarkers.map((pos, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ delay: 0.2 + (i * 0.1) }}
                     className="absolute flex items-center justify-center"
                     style={{ top: pos.top, left: pos.left }}
                   >
                     <MapPin size={24} fill="#ef4444" className="text-red-900 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                   </motion.div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: List & Actions */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={2} className="lg:col-span-4 flex flex-col">
          <Card className="flex-1 bg-card/40 border border-border/50 flex flex-col overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/30 shrink-0">
              <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Active Deployments</span>
                <span>Staff</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
               {deployments.filter(d => d.status === 'ACTIVE').length === 0 && !isLoading && (
                 <div className="p-6 text-center text-muted-foreground text-sm">
                   No active security deployments.
                 </div>
               )}
               {deployments.filter(d => d.status === 'ACTIVE').map((dep) => (
                 <div key={dep.id} className="flex justify-between items-center p-4 border-b border-border/10 hover:bg-white/5 transition-colors group">
                   <span className="text-sm font-medium text-foreground/90">{dep.zone}</span>
                   <div className="flex items-center gap-4">
                     <span className="text-sm font-bold text-foreground">{dep.staffCount}</span>
                     <button 
                       onClick={() => setCancelConfig({ isOpen: true, dep })}
                       className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-500/20 rounded transition-all"
                       title="Recall Units"
                     >
                       <X size={14} />
                     </button>
                   </div>
                 </div>
               ))}
            </CardContent>
            
            {/* Quick Deploy Form */}
            <div className="p-4 border-t border-border/30 bg-black/20 shrink-0 space-y-3">
               <div className="flex gap-2">
                 <select 
                   value={deployConfig.zone}
                   onChange={(e) => setDeployConfig(p => ({ ...p, zone: e.target.value }))}
                   className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                 >
                   <option value="Main Entrance">Main Entrance</option>
                   <option value="Food Court">Food Court</option>
                   <option value="West Wing">West Wing</option>
                   <option value="Gate 3">Gate 3</option>
                   <option value="VIP Area">VIP Area</option>
                 </select>
                 <input 
                   type="number" 
                   value={deployConfig.staffCount}
                   onChange={(e) => setDeployConfig(p => ({ ...p, staffCount: parseInt(e.target.value) || 1 }))}
                   min="1"
                   max="50"
                   className="w-20 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-center"
                 />
               </div>
               <button 
                 onClick={() => setDeployConfig(p => ({ ...p, isOpen: true }))}
                 className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
               >
                 <Plus size={16} /> Deploy New Staff
               </button>
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
