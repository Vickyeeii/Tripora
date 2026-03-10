import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI, usersAPI, feedbacksAPI } from '../services/api';
import { Calendar, MapPin, Clock, ArrowLeft, Share2 } from 'lucide-react';
import BookingModal from '../components/bookings/BookingModal';
import FeedbackList from '../components/feedback/FeedbackList';

const EventDetail = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [user, setUser] = useState(null);
    const userRole = localStorage.getItem('user_role');
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch event
                const eventRes = await eventsAPI.getById(id);
                setEvent(eventRes.data);

                // Fetch user if logged in
                if (userRole) {
                    try {
                        const userRes = await usersAPI.getMyProfile();
                        setUser({
                            ...userRes.data,
                            role: userRole
                        });
                    } catch (err) {
                        console.error("Failed to load user profile", err);
                    }
                }
            } catch (error) {
                console.error("Failed to load event", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchFeedbacks = async () => {
            try {
                const res = await feedbacksAPI.getEventFeedbacks(id);
                setFeedbacks(res.data);
            } catch (e) {
                console.error("Failed to load feedbacks", e);
            }
        };

        fetchData();
        fetchFeedbacks();
    }, [id, userRole]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#E6E4DD] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#1A2F23] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-[#E6E4DD] flex items-center justify-center text-[#1A2F23]">
                Event not found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E6E4DD] font-sans selection:bg-[#1A2F23] selection:text-[#E6E4DD]">

            {/* Header Image */}
            <div className="relative h-[50vh] min-h-[400px]">
                <div className="absolute inset-0">
                    <img
                        src={event.image_url || "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?q=80&w=1600&auto=format"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#E6E4DD]" />
                </div>

                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center text-white z-10">
                    <Link to="/events" className="p-3 bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <button className="p-3 bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 transition-colors">
                        <Share2 className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10 pb-20">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#1A2F23]/5">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-[#1A2F23]/10 pb-8">
                        <div>
                            <span className="inline-block px-4 py-1 bg-[#1A2F23]/5 text-[#1A2F23] rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                                Cultural Event
                            </span>
                            <h1 className="font-serif text-4xl md:text-5xl text-[#1A2F23] mb-2 leading-tight">
                                {event.title}
                            </h1>
                            <div className="flex items-center text-[#1A2F23]/60 gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{event.heritage?.name || "Kerala Heritage Site"}</span>
                            </div>
                        </div>

                        <div className="text-center bg-[#1A2F23] text-[#E6E4DD] p-4 rounded-2xl min-w-[100px]">
                            <p className="text-xs uppercase tracking-widest opacity-60">Date</p>
                            <p className="font-serif text-3xl">{new Date(event.event_date).getDate()}</p>
                            <p className="text-sm uppercase tracking-wider">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-8 text-lg font-light text-[#1A2F23]/80 leading-relaxed">
                            <p>
                                {event.description}
                            </p>

                            <h3 className="font-serif text-2xl text-[#1A2F23] pt-6">Event Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-[#1A2F23]/5 rounded-full flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-[#1A2F23]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1A2F23]">Time</p>
                                        <p>{event.start_time ? new Date(`1970-01-01T${event.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-[#1A2F23]/5 rounded-full flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-[#1A2F23]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1A2F23]">Location</p>
                                        <p>{event.location || event.heritage?.location || "On-site"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 border-t border-[#1A2F23]/10 pt-12">
                                <h3 className="font-serif text-2xl text-[#1A2F23] mb-8">Reviews</h3>
                                <FeedbackList feedbacks={feedbacks} />
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <div className="bg-[#E6E4DD] p-6 rounded-2xl sticky top-8">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/50 mb-4">Ticket Price</p>
                                <p className="font-serif text-4xl text-[#1A2F23] mb-6">
                                    {event.ticket_price > 0 ? `₹${event.ticket_price}` : 'Free'}
                                </p>

                                <button
                                    onClick={() => setIsBookingOpen(true)}
                                    className="w-full bg-[#1A2F23] text-[#E6E4DD] py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#2C4A3A] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                >
                                    Book Ticket
                                </button>
                                <p className="text-center text-xs text-[#1A2F23]/40 mt-4">
                                    Limited seats available.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div >

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                heritageId={event.heritage_id}
                eventId={event.id}
                eventDate={event.event_date}
                title={event.title}
                user={userRole ? user : null}
            />
        </div >
    );
};

export default EventDetail;
