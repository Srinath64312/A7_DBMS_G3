import React from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none select-none">
      {toasts.map(toast => {
        const icon =
          toast.type === 'success' ? 'fa-circle-check text-emerald-600' :
          toast.type === 'error' ? 'fa-circle-xmark text-rose-600' :
          toast.type === 'warning' ? 'fa-triangle-exclamation text-amber-500' :
          'fa-circle-info text-blue-500';

        return (
          <div
            key={toast.id}
            onClick={() => onRemove(toast.id)}
            className="pointer-events-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-md px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-[#0f1111] dark:text-slate-100 min-w-[240px] max-w-sm transition-all duration-300 animate-slideInRight"
          >
            <i className={`fa-solid ${icon} text-base shrink-0`}></i>
            <span className="font-semibold flex-1 leading-snug">{toast.text}</span>
            <button className="text-gray-400 hover:text-gray-600 text-xs ml-2">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        );
      })}
    </div>
  );
};
