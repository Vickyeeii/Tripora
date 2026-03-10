import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Toast = ({ message, type = 'success', onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const config = {
    success: {
      border: 'border-l-emerald-500',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      border: 'border-l-red-500',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    warning: {
      border: 'border-l-amber-500',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
  };

  const current = config[type] || config.success;

  return createPortal(
    <div
      className={`fixed top-6 right-6 z-[9999] transition-all duration-300 ease-in-out transform ${isExiting ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
        }`}
    >
      <div className={`flex items-start gap-4 p-4 pr-10 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg min-w-[320px] max-w-sm border border-zinc-100 border-l-4 ${current.border}`}>

        {/* Icon */}
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${current.iconBg} ${current.iconColor}`}>
          {current.icon}
        </div>

        {/* Content */}
        <div className="flex-1 pt-0.5">
          <h4 className="text-sm font-bold text-zinc-900 capitalize leading-none mb-1">
            {type === 'error' ? 'Error' : type}
          </h4>
          <p className="text-sm text-zinc-600 font-medium leading-normal">
            {message}
          </p>
        </div>

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Toast;
