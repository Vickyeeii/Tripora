import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#1A2F23]/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-[#E6E4DD] rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-[scale-in_0.2s_ease-out]">
                <h3 className="text-2xl font-serif font-bold text-[#1A2F23] mb-3">
                    {title}
                </h3>
                <p className="text-[#1A2F23]/70 mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-[#1A2F23]/10 rounded-xl font-bold text-[#1A2F23] hover:bg-white transition-all text-sm uppercase tracking-wider"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold text-[#E6E4DD] transition-all text-sm uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${isDanger
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20'
                                : 'bg-[#1A2F23] hover:bg-[#122219] shadow-[#1A2F23]/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
