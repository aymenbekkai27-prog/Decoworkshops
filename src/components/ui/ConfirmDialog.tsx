import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'تأكيد', cancelLabel = 'إلغاء',
  danger = false, onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
        <h3 className="text-lg font-bold text-navy-800 mb-2">{title}</h3>
        <div className="text-sm text-slate-600 mb-5 leading-relaxed">{message}</div>
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
