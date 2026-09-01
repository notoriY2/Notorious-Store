import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { AdminButton } from './AdminUI';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function useConfirm() {
  const [state, setState] = React.useState<{
    open: boolean; title: string; message: string; confirmLabel?: string;
    resolve?: (v: boolean) => void;
  }>({ open: false, title: '', message: '' });

  const confirm = (title: string, message: string, confirmLabel = 'Delete') =>
    new Promise<boolean>(resolve => {
      setState({ open: true, title, message, confirmLabel, resolve });
    });

  const element = (
    <ConfirmDialog
      isOpen={state.open}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      onConfirm={() => { state.resolve?.(true); setState(s => ({ ...s, open: false })); }}
      onCancel={() => { state.resolve?.(false); setState(s => ({ ...s, open: false })); }}
    />
  );

  return { confirm, ConfirmDialogElement: element };
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, title, message, confirmLabel = 'Confirm', isDangerous = true,
  isLoading = false, onConfirm, onCancel,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDangerous ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-600'}`}>
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-medium text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{message}</p>
            </div>
            <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-gray-700"><X size={15} /></button>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <AdminButton variant="secondary" onClick={onCancel}>Cancel</AdminButton>
            <AdminButton variant={isDangerous ? 'danger' : 'primary'} onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Working...' : confirmLabel}
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
};