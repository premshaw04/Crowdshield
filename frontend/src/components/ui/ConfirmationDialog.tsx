'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from './modal';
import { AlertTriangle, Loader2 } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  intent?: 'danger' | 'primary';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isProcessing = false,
  intent = 'primary'
}) => {
  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && !isProcessing && onCancel()}>
      <ModalContent className="max-w-md bg-[#0f141f] border-[#212b3e]">
        <ModalHeader className="gap-3">
          <div className="flex items-center gap-3">
            {intent === 'danger' ? (
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-red-500 w-5 h-5" />
              </div>
            ) : null}
            <ModalTitle className="text-xl">{title}</ModalTitle>
          </div>
          <ModalDescription className="text-slate-400 text-sm leading-relaxed pt-2">
            {message}
          </ModalDescription>
        </ModalHeader>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-[#1a2334] rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-50 ${
              intent === 'danger'
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isProcessing && <Loader2 size={14} className="animate-spin" />}
            {isProcessing ? 'Processing...' : confirmText}
          </button>
        </div>
      </ModalContent>
    </Modal>
  );
};
