import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastVariant = 'default' | 'success' | 'error';

export interface ToastItem {
  id: number;
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 4000;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      setToasts((current) => {
        const id = Date.now() + Math.random();
        const duration = toast.duration ?? DEFAULT_DURATION;
        window.setTimeout(() => removeToast(id), duration);
        return [...current, { id, ...toast, duration }];
      });
    },
    [removeToast],
  );

  const contextValue = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto overflow-hidden rounded-md border px-4 py-3 shadow-lg transition ${
              toast.variant === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : toast.variant === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-slate-200 bg-white text-slate-800'
            }`}
          >
            {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
            <p className="mt-1 text-sm">{toast.description}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
