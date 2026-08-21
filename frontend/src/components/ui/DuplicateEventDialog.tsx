'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from './modal';
import { Copy, Loader2 } from 'lucide-react';

export interface DuplicateEventDialogProps {
  isOpen: boolean;
  originalEventName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const DuplicateEventDialog: React.FC<DuplicateEventDialogProps> = ({
  isOpen,
  originalEventName,
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  const [eventName, setEventName] = useState('');

  // Reset input when dialog opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEventName(`${originalEventName} (Copy)`);
    }
  }, [isOpen, originalEventName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventName.trim()) {
      onConfirm(eventName.trim());
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && !isProcessing && onCancel()}>
      <ModalContent className="max-w-md bg-[#0f141f] border-[#212b3e]">
        <ModalHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Copy className="text-blue-500 w-5 h-5" />
            </div>
            <ModalTitle className="text-xl">Duplicate Event</ModalTitle>
          </div>
          <ModalDescription className="text-slate-400 text-sm leading-relaxed pt-2">
            This will create a new UPCOMING event with the exact same venue, zones, gates, cameras, and safety thresholds. Runtime metrics, predictions, and audit logs will NOT be copied.
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="eventName" className="block text-sm font-medium text-slate-300 mb-1.5">
                New Event Name <span className="text-red-400">*</span>
              </label>
              <input
                id="eventName"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter new event name"
                required
                disabled={isProcessing}
                className="w-full bg-[#111622] border border-[#212b3e] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-[#1a2334] rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isProcessing || !eventName.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isProcessing && <Loader2 size={14} className="animate-spin" />}
              {isProcessing ? 'Duplicating...' : 'Duplicate Event'}
            </button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};
