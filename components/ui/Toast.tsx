
import React, { useEffect } from 'react';
import { Icons } from './Icons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const bgColors = {
    success: 'bg-white border-green-100',
    error: 'bg-white border-red-100',
    info: 'bg-white border-blue-100',
    warning: 'bg-white border-orange-100'
  };

  const icons = {
    success: <Icons.Check className="w-5 h-5 text-green-500" />,
    error: <Icons.Alert className="w-5 h-5 text-red-500" />,
    info: <Icons.Sparkles className="w-5 h-5 text-blue-500" />,
    warning: <Icons.Alert className="w-5 h-5 text-orange-500" />
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border w-80 transform transition-all duration-300 animate-slide-in-right ${bgColors[toast.type]}`}>
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900">{toast.title}</h4>
        {toast.message && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{toast.message}</p>}
      </div>
      <button onClick={() => onClose(toast.id)} className="text-gray-400 hover:text-gray-600">
        <Icons.X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
};
