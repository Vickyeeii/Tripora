import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { bookingsAPI, complaintsAPI } from '../services/api';
import { Search, ArrowRight, Loader, Calendar, Clock, Users, MapPin, CheckCircle, XCircle, Clock4 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import FeedbackModal from '../components/feedback/FeedbackModal';
import ComplaintModal from '../components/complaints/ComplaintModal';

const TrackBooking = () => {
    const [searchParams] = useSearchParams();
    const [reference, setReference] = useState(searchParams.get('ref') || '');
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState('');
    const [complaint, setComplaint] = useState(null);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isComplaintOpen, setIsComplaintOpen] = useState(false);

    useEffect(() => {
        const refParam = searchParams.get('ref');
        if (refParam) {
            setReference(refParam);
            handleTrack(refParam);
        }
    }, []);

    const handleTrack = async (refCode) => {
        if (!refCode) return;
        setLoading(true);
        setError('');
        setBooking(null);

        try {
            const response = await bookingsAPI.track(refCode);
            setBooking(response.data);

            // Also check for complaints
            try {
                const complaintRes = await complaintsAPI.track(refCode);
                setComplaint(complaintRes.data);
            } catch (cErr) {
                // No complaint found, ignore
                setComplaint(null);
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Booking not found. Please check the reference code.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleTrack(reference);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="w-5 h-5 mr-2" />;
            case 'cancelled': return <XCircle className="w-5 h-5 mr-2" />;
            default: return <Clock4 className="w-5 h-5 mr-2" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#1A2F23] p-6 md:p-12 font-sans selection:bg-[#E6E4DD] selection:text-[#1A2F23]">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <Link to="/" className="text-[#E6E4DD] font-serif font-bold text-2xl tracking-tighter hover:opacity-80 transition-opacity">
                        Tripora.
                    </Link>
                    <Link to="/login" className="text-[#E6E4DD]/70 hover:text-[#E6E4DD] text-sm font-bold uppercase tracking-widest transition-colors">
                        Sign In
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-12">

                    {/* Left: Search Box */}
                    <div className="w-full md:w-1/2">
                        <h1 className="font-serif text-5xl md:text-6xl text-[#E6E4DD] mb-6 leading-[1.1]">
                            Track Your<br />Journey.
                        </h1>
                        <p className="text-[#E6E4DD]/60 text-lg mb-12 max-w-sm font-light">
                            Enter your booking reference code to check the current status of your request.
                        </p>

                        <form onSubmit={handleSubmit} className="bg-[#E6E4DD] p-2 rounded-full flex shadow-2xl max-w-md">
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value.toUpperCase())}
                                placeholder="REF-XXXXXX"
                                className="flex-1 bg-transparent px-6 py-4 text-[#1A2F23] font-bold placeholder:text-[#1A2F23]/30 outline-none uppercase tracking-wider"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#1A2F23] text-[#E6E4DD] rounded-full w-14 h-14 flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-100 flex items-center">
                                <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right: Result Card */}
                    <div className="w-full md:w-1/2">
                        {booking ? (
                            <div className="bg-[#E6E4DD] rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/40">Status</span>
                                        <div className={`mt-2 inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                                            {getStatusIcon(booking.status)}
                                            {booking.status}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/40">Reference</span>
                                        <p className="font-serif text-2xl font-bold text-[#1A2F23] mt-1">{booking.reference_code}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-[#1A2F23]/5">
                                        <div className="p-3 bg-[#1A2F23]/5 rounded-xl">
                                            <Calendar className="w-6 h-6 text-[#1A2F23]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/40 mb-1">Date</p>
                                            <p className="text-lg font-medium text-[#1A2F23]">{format(parseISO(booking.visit_date), 'MMMM d, yyyy')}</p>
                                        </div>
                                    </div>

                                    {booking.visit_time && (
                                        <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-[#1A2F23]/5">
                                            <div className="p-3 bg-[#1A2F23]/5 rounded-xl">
                                                <Clock className="w-6 h-6 text-[#1A2F23]" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/40 mb-1">Time</p>
                                                <p className="text-lg font-medium text-[#1A2F23]">{booking.visit_time}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-[#1A2F23]/5">
                                        <div className="p-3 bg-[#1A2F23]/5 rounded-xl">
                                            <Users className="w-6 h-6 text-[#1A2F23]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/40 mb-1">Guests</p>
                                            <p className="text-lg font-medium text-[#1A2F23]">{booking.people_count} People</p>
                                        </div>
                                    </div>
                                </div>



                                {(booking.status === 'confirmed' || booking.status === 'completed') && (
                                    <div className="mt-8 pt-8 border-t border-[#1A2F23]/10 space-y-4">
                                        <button
                                            onClick={() => setIsFeedbackOpen(true)}
                                            className="w-full py-4 bg-[#1A2F23] text-[#E6E4DD] rounded-2xl font-bold uppercase tracking-widest hover:bg-[#14241B] transition-colors shadow-lg shadow-[#1A2F23]/20"
                                        >
                                            Leave Feedback
                                        </button>

                                        <button
                                            onClick={() => setIsComplaintOpen(true)}
                                            className="w-full py-2 text-[#1A2F23]/60 font-bold uppercase tracking-widest text-xs hover:text-red-700 transition-colors"
                                        >
                                            Report an Issue
                                        </button>
                                    </div>
                                )}

                                {complaint && (
                                    <div className="mt-8 p-6 bg-white rounded-2xl border border-orange-100 bg-orange-50/50">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-[#1A2F23]">Reported Issue</h3>
                                            <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded bg-white border ${complaint.status === 'resolved' ? 'text-emerald-700 border-emerald-200' : 'text-amber-700 border-amber-200'
                                                }`}>
                                                {complaint.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#1A2F23]/70 mb-4">{complaint.subject}</p>

                                        {complaint.admin_reply && (
                                            <div className="mt-4 pt-4 border-t border-orange-200/50">
                                                <p className="text-xs font-bold text-[#1A2F23]/50 uppercase tracking-widest mb-1">Response from Support</p>
                                                <p className="text-sm text-[#1A2F23]">{complaint.admin_reply}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-6 text-center">
                                    <p className="text-[#1A2F23]/50 text-sm">Need to make changes? <a href="#" className="font-bold text-[#1A2F23] underline">Contact Support</a></p>
                                </div>
                            </div>
                        ) : (
                            /* Placeholder State */
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[#E6E4DD]/5 rounded-[2.5rem] border-2 border-dashed border-[#E6E4DD]/20 min-h-[400px]">
                                <div className="w-20 h-20 bg-[#E6E4DD]/10 rounded-full flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-[#E6E4DD]/40" />
                                </div>
                                <p className="text-[#E6E4DD]/40 font-medium">Tracking details will appear here</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                booking={booking}
                isGuest={true}
                onSuccess={() => setIsFeedbackOpen(false)}
            />

            <ComplaintModal
                isOpen={isComplaintOpen}
                onClose={() => setIsComplaintOpen(false)}
                booking={booking}
                isGuest={true}
                onSuccess={() => {
                    setIsComplaintOpen(false);
                    // Optionally show success message
                }}
            />
        </div >
    );
};

export default TrackBooking;
