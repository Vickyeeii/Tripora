import React from 'react';
import { Star, User, Calendar } from 'lucide-react';

const FeedbackList = ({ feedbacks }) => {
    if (!feedbacks || feedbacks.length === 0) {
        return (
            <div className="text-center py-12 bg-[#F9F8F6] rounded-2xl border border-[#1A2F23]/5">
                <Star className="w-12 h-12 text-[#1A2F23]/10 mx-auto mb-4" />
                <p className="text-[#1A2F23]/40 font-medium">No reviews yet. Be the first to share your experience!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {feedbacks.map((feedback) => (
                <div key={feedback.id} className="bg-white p-6 rounded-2xl border border-[#1A2F23]/5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="font-serif font-bold text-[#1A2F23] text-lg mb-1">{feedback.title}</h4>
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < feedback.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <span className="text-xs font-bold text-[#1A2F23]/30 uppercase tracking-widest bg-[#F9F8F6] px-3 py-1 rounded-full">
                            Verified Visit
                        </span>
                    </div>

                    <p className="text-[#1A2F23]/70 leading-relaxed mb-6">
                        "{feedback.comment}"
                    </p>

                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#1A2F23]/40 border-t border-[#1A2F23]/5 pt-4">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {/* In a real app we would join with user table or store user name in feedback. For now showing generic or reference if available */}
                            <span>
                                {feedback.reference_code ? `Guest (${feedback.reference_code.slice(0, 6)}...)` : 'Tripora Traveler'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeedbackList;
