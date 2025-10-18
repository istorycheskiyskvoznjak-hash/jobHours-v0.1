import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, TrashIcon } from './IconComponents';

export type ToastType = 'success' | 'error' | 'delete';

interface ToastProps {
  message: string;
  isVisible: boolean;
  type: ToastType;
}

const toastConfig: Record<ToastType, { icon: React.ReactNode; borderColor: string; }> = {
  success: {
    icon: <CheckCircleIcon className="h-6 w-6 text-success" />,
    borderColor: 'border-success/30',
  },
  error: {
    icon: <ExclamationTriangleIcon className="h-6 w-6 text-primary" />,
    borderColor: 'border-primary/30',
  },
  delete: {
    icon: <TrashIcon className="h-6 w-6 text-primary" />,
    borderColor: 'border-primary/30',
  },
};


export const Toast: React.FC<ToastProps> = ({ message, isVisible, type }) => {
  const [show, setShow] = useState(false);
  const config = toastConfig[type] || toastConfig.success;

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, 2500); 
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);
  
  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl bg-surface border ${config.borderColor} transition-all duration-300 w-auto max-w-sm mx-4 ${
        show ? 'transform-none opacity-100' : 'translate-y-4 opacity-0'
      }`}
      role="alert"
      aria-live="assertive"
    >
      {config.icon}
      <p className="text-base font-medium text-text-heading">{message}</p>
    </div>
  );
};