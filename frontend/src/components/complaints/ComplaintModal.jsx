import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { complaintsAPI } from '../../services/api';

const ComplaintModal = ({ isOpen, onClose, booking, onSuccess, isGuest = false }) => {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const complaintData = {
                subject,
                description,
                booking_id: booking?.id || null,
                heritage_id: booking?.heritage_id || null,
                event_id: booking?.event_id || null,
            };

            if (isGuest) {
                if (booking?.reference_code) {
                    complaintData.reference_code = booking.reference_code;
                }
                await complaintsAPI.createGuest(complaintData);
            } else {
                await complaintsAPI.createTourist(complaintData);
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.detail
                || "Failed to submit complaint. " + (err.response?.data ? JSON.stringify(err.response.data) : "")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2F23]/20 backdrop-blur-sm">
            <div className="bg-[#E6E4DD] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#1A2F23]/10">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#1A2F23]/10 flex items-center justify-between bg-white/50">
                    <h3 className="text-xl font-serif text-[#1A2F23] font-bold">Report an Issue</h3>
                    <button onClick={onClose} className="p-2 hover:bg-[#1A2F23]/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-[#1A2F23]/60" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Context Info */}
                    {booking && (
                        <div className="bg-[#1A2F23]/5 p-4 rounded-xl border border-[#1A2F23]/10 flex items-start gap-4">
                            <div className="p-2 bg-[#1A2F23]/10 rounded-full">
                                <AlertCircle className="w-5 h-5 text-[#1A2F23]" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/60 mb-1">
                                    Regarding Booking
                                </p>
                                <p className="font-bold text-[#1A2F23] text-sm">
                                    {booking.heritage?.name || booking.event?.title || booking.reference_code}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/60 ml-1">Subject</label>
                            <input
                                type="text"
                                required
                                minLength={5}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Briefly describe the issue"
                                className="w-full px-4 py-3 rounded-xl bg-white border border-[#1A2F23]/10 focus:outline-none focus:border-[#1A2F23]/30 font-bold text-[#1A2F23] placeholder-[#1A2F23]/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/60 ml-1">Description</label>
                            <textarea
                                required
                                minLength={10}
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Please provide more details about the problem..."
                                className="w-full px-4 py-3 rounded-xl bg-white border border-[#1A2F23]/10 focus:outline-none focus:border-[#1A2F23]/30 font-medium text-[#1A2F23] placeholder-[#1A2F23]/20 resize-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#1A2F23] text-[#E6E4DD] rounded-xl font-bold uppercase tracking-widest hover:bg-[#14241B] disabled:opacity-70 transition-colors shadow-lg shadow-[#1A2F23]/20"
                    >
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ComplaintModal;
