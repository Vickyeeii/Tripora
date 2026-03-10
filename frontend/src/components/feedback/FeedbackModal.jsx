import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { feedbacksAPI } from '../../services/api';

const FeedbackModal = ({ isOpen, onClose, booking, onSuccess, isGuest = false }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !booking) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (rating === 0) {
            setError("Please select a star rating");
            setLoading(false);
            return;
        }

        try {
            const feedbackData = {
                heritage_id: booking.heritage_id,
                rating,
                title,
                comment,
                event_id: booking.event_id || null
            };

            if (isGuest) {
                feedbackData.reference_code = booking.reference_code;
                await feedbacksAPI.createGuest(feedbackData);
            } else {
                feedbackData.booking_id = booking.id;
                await feedbacksAPI.createTourist(feedbackData);
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.detail
                || "Failed to submit feedback. " + (err.response?.data ? JSON.stringify(err.response.data) : "")
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
                    <h3 className="text-xl font-serif text-[#1A2F23] font-bold">Write a Review</h3>
                    <button onClick={onClose} className="p-2 hover:bg-[#1A2F23]/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-[#1A2F23]/60" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Booking Info */}
                    <div className="bg-[#1A2F23]/5 p-4 rounded-xl border border-[#1A2F23]/10">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/60 mb-1">
                            {booking.heritage?.name || booking.event?.title || "Booking"}
                        </p>
                        <p className="font-mono font-bold text-[#1A2F23] text-sm">{booking.reference_code}</p>
                        <p className="text-xs text-[#1A2F23]/70">Visited on {new Date(booking.visit_date).toLocaleDateString()}</p>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex flex-col items-center gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/60">Your Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= (hoverRating || rating)
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'fill-[#1A2F23]/10 text-[#1A2F23]/20'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/60 ml-1">Title</label>
                            <input
                                type="text"
                                required
                                minLength={5}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Summarize your experience"
                                className="w-full px-4 py-3 rounded-xl bg-white border border-[#1A2F23]/10 focus:outline-none focus:border-[#1A2F23]/30 font-bold text-[#1A2F23] placeholder-[#1A2F23]/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/60 ml-1">Review</label>
                            <textarea
                                required
                                minLength={10}
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What did you like or dislike? How was the guide?"
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
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
