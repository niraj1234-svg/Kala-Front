import React from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const confirmClassNames: Record<'primary' | 'danger', string> = {
  primary: 'bg-slate-900 hover:bg-black',
  danger: 'bg-red-600 hover:bg-red-700',
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  loading,
}) => (
  <Modal
    open={open}
    onClose={() => {
      if (!loading) {
        onCancel();
      }
    }}
    title={title}
    description={description}
    size="sm"
    footer={
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-70 ${confirmClassNames[confirmVariant]}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Working…' : confirmLabel}
        </button>
      </div>
    }
  >
    {description ? null : <p className="text-sm text-slate-600">Are you sure you want to continue?</p>}
  </Modal>
);
