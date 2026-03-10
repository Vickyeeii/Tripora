import React, { useState } from 'react';
import { paymentsAPI } from '../../services/api';
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, booking, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !booking) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const parsedAmount = parseInt(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please enter a valid amount greater than 0');
            setLoading(false);
            return;
        }

        try {
            await paymentsAPI.create({
                booking_id: booking.id,
                amount: parsedAmount,
                payment_method: paymentMethod
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.detail
                || err.response?.data?.message
                || 'Failed to record payment'
            );
        } finally {
            setLoading(false);
        }
    };

    const methods = [
        { id: 'CASH', label: 'Cash', icon: Banknote },
        { id: 'UPI', label: 'UPI', icon: Smartphone },
        { id: 'CARD', label: 'Card', icon: CreditCard },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2F23]/20 backdrop-blur-sm">
            <div className="bg-[#E6E4DD] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#1A2F23]/10">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#1A2F23]/10 flex items-center justify-between bg-white/50">
                    <h3 className="text-xl font-serif text-[#1A2F23] font-bold">Record Payment</h3>
                    <button onClick={onClose} className="p-2 hover:bg-[#1A2F23]/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-[#1A2F23]/60" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Booking Amount Info - In a real app we might fetch the expected price */}
                    <div className="bg-[#1A2F23]/5 p-4 rounded-xl border border-[#1A2F23]/10">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/60 mb-1">Booking Reference</p>
                        <p className="font-mono font-bold text-[#1A2F23] text-lg">{booking.reference_code}</p>
                        <p className="text-sm text-[#1A2F23]/70 mt-1">visitor: {booking.visitor_name}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/60 ml-1">Payment Method</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {methods.map((m) => {
                                const Icon = m.icon;
                                const isSelected = paymentMethod === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(m.id)}
                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${isSelected
                                            ? 'bg-[#1A2F23] text-[#E6E4DD] border-[#1A2F23] shadow-md'
                                            : 'bg-white text-[#1A2F23]/60 border-transparent hover:bg-white/80'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-xs font-bold">{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/60 ml-1">Amount Received (₹)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-[#1A2F23]/10 focus:outline-none focus:border-[#1A2F23]/30 text-lg font-bold text-[#1A2F23] placeholder-[#1A2F23]/20"
                            placeholder="0.00"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#BC5A45] text-[#E6E4DD] rounded-xl font-bold uppercase tracking-widest hover:bg-[#A34A36] disabled:opacity-70 transition-colors shadow-lg shadow-[#BC5A45]/20"
                    >
                        {loading ? 'Processing...' : 'Confirm Payment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
