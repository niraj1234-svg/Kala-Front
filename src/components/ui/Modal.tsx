import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClassMap = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, description, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (open) {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
      };
    }
    return undefined;
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`w-full rounded-lg bg-white shadow-xl ${sizeClassMap[size]}`}>
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
            aria-label="Close modal"
          >
            X
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4 text-sm text-slate-700">
          {children}
        </div>
        {footer && <div className="border-t border-slate-200 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
};
