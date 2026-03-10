import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, description, confirmText = 'Confirm', confirmStyle = 'danger' }) => {
  if (!isOpen) return null;

  const buttonStyles = {
    danger: 'bg-[#8b0000] hover:bg-[#6b0000]',
    warning: 'bg-[#FFED29] hover:bg-[#e6d526] text-zinc-900',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-zinc-900 mb-2">{title}</h3>
        <p className="text-zinc-600 mb-6">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-colors ${buttonStyles[confirmStyle]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
