'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { DataTableCard, TableColumn } from '@/components/widgets/DataTableCard';

// Define the tabs based on screenshot and request
const SETTINGS_TABS = [
  { id: 'general', label: 'General' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'storage', label: 'Backup & System Storage' },
  { id: 'users', label: 'Users & Roles' },
  { id: 'audit', label: 'Audit Logs' },
  { id: 'ai', label: 'AI Settings' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('notifications');

  // Notifications State
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [criticalNotif, setCriticalNotif] = useState(true);
  const [aiNotif, setAiNotif] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(75);

  // Users State
  const userColumns: TableColumn[] = [
    { key: 'user', header: 'Users', width: '30%' },
    { key: 'role', header: 'Roles', width: '20%' },
    { key: 'status', header: 'Status', width: '25%' },
    { key: 'lastActive', header: 'Last Active', width: '25%' },
  ];

  const userData = [
    { id: 1, user: 'Bogdan Nikitin', role: 'Super Admin', status: 'Online', lastActive: '11:40 AM' },
    { id: 2, user: 'Riya Sharma', role: 'Manager', status: 'Online', lastActive: '11:38 AM' },
    { id: 3, user: 'Anjali Patel', role: 'Security Head', status: 'Online', lastActive: '11:25 AM' },
    { id: 4, user: 'Neha Verma', role: 'Operator', status: 'Offline', lastActive: '10:50 AM' },
    { id: 5, user: 'Rahul Mehta', role: 'Viewer', status: 'Online', lastActive: '11:36 AM' },
  ];

  // Render Form based on Active Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full space-y-6"
          >
            <div className="flex-1 space-y-8">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm text-foreground/90 font-medium">Email Notifications</span>
                  <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm text-foreground/90 font-medium">SMS Notifications</span>
                  <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm text-foreground/90 font-medium">Push Notifications</span>
                  <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm text-foreground/90 font-medium">Critical Alerts</span>
                  <Switch checked={criticalNotif} onCheckedChange={setCriticalNotif} />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm text-foreground/90 font-medium">AI Recommendations</span>
                  <Switch checked={aiNotif} onCheckedChange={setAiNotif} />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/90 font-medium">Alert Threshold</span>
                  <span className="text-xs font-bold text-muted-foreground">{alertThreshold}%</span>
                </div>
                <div className="px-1">
                   <Slider value={alertThreshold} onValueChange={setAlertThreshold} />
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 mt-auto">
              <button className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-md shadow-md transition-all">
                Save Changes
              </button>
            </div>
          </motion.div>
        );
      
      case 'users':
        return (
          <motion.div
            key="users"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full space-y-6"
          >
             <div className="flex-1">
               <DataTableCard 
                 title="Users & Roles" 
                 columns={userColumns} 
                 data={userData.map(u => ({
                   ...u,
                   user: (
                     <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">
                         {u.user.charAt(0)}
                       </div>
                       <span className="font-medium">{u.user}</span>
                     </div>
                   ),
                   status: (
                     <span className={`text-xs font-semibold flex items-center gap-1.5 ${u.status === 'Online' ? 'text-green-500' : 'text-muted-foreground'}`}>
                       <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Online' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-muted-foreground'}`} />
                       {u.status}
                     </span>
                   )
                 }))} 
               />
             </div>
             
             <div className="flex justify-end pt-4">
               <button className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white font-semibold py-2 px-6 rounded-md shadow-sm transition-all">
                 + Add User
               </button>
             </div>
          </motion.div>
        );
      case 'audit':
        return (
          <motion.div
            key="audit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full space-y-6"
          >
             <div className="flex-1">
               <DataTableCard 
                 title="System Audit Logs" 
                 columns={[
                   { key: 'time', header: 'Timestamp', width: '20%' },
                   { key: 'user', header: 'User', width: '20%' },
                   { key: 'action', header: 'Action', width: '40%' },
                   { key: 'status', header: 'Status', width: '20%' },
                 ]} 
                 data={[
                   { time: '11:42 AM', user: 'Bogdan Nikitin', action: 'Approved AI Recommendation #4', status: 'Success' },
                   { time: '11:38 AM', user: 'System', action: 'Automated Gate 2 Closure', status: 'Success' },
                   { time: '11:15 AM', user: 'Riya Sharma', action: 'Deployed 5 Security Units', status: 'Success' },
                 ]} 
               />
             </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full text-muted-foreground"
          >
            Configuration panel for {SETTINGS_TABS.find(t => t.id === activeTab)?.label}
          </motion.div>
        );
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto h-[calc(100vh-8rem)] min-h-[600px] flex flex-col">
      <h1 className="text-xl font-bold text-foreground mb-6">Settings</h1>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Sidebar (Navigation) */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="bg-card/40 border border-border/50 rounded-lg p-2 space-y-1">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                    : 'text-foreground/70 hover:bg-white/5 hover:text-foreground border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-card/40 border border-border/50 rounded-lg p-6 lg:p-8 h-full shadow-lg relative overflow-hidden">
            
            {/* Header for Active Tab */}
            <h2 className="text-lg font-semibold text-foreground mb-6 border-b border-border/30 pb-4">
              {activeTab === 'notifications' ? 'Notification Settings' : SETTINGS_TABS.find(t => t.id === activeTab)?.label}
            </h2>

            {/* Dynamic Content */}
            <div className="h-[calc(100%-4rem)] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="wait">
                {renderContent()}
              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
