import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import EventCard from '../components/events/EventCard';
import Toast from '../components/ui/Toast';
import BookingModal from '../components/bookings/BookingModal';

const EventsList = () => {
    const [activeTab, setActiveTab] = useState('today'); // 'today' or 'tomorrow'
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const handleBook = (event) => {
        setSelectedEvent(event);
        setIsBookingOpen(true);
    };

    useEffect(() => {
        fetchEvents();
    }, [activeTab]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = activeTab === 'today'
                ? await eventsAPI.getToday()
                : await eventsAPI.getTomorrow();
            setEvents(response.data);
        } catch (error) {
            setToast({ message: 'Failed to load events', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Editorial Hero Section */}
            <div className="relative py-16 mb-12 border-b border-zinc-200">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50 -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <span className="text-emerald-700 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                        Cultural Calendar
                    </span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#1A2F23] tracking-tight mb-6">
                        The Living<br /><span className="italic font-light text-zinc-400">Traditions</span>
                    </h1>
                    <p className="text-zinc-600 text-lg max-w-xl leading-relaxed mb-10">
                        Immerse yourself in the divine rhythm of Kerala. From ecstatic Theyyam performances to serene temple rituals, witness history in motion.
                    </p>

                    {/* Filter Tabs */}
                    <div className="inline-flex bg-zinc-100 p-1.5 rounded-full">
                        <button
                            onClick={() => setActiveTab('today')}
                            className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'today'
                                ? 'bg-[#1A2F23] text-white shadow-lg'
                                : 'text-zinc-500 hover:text-zinc-900'
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setActiveTab('tomorrow')}
                            className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'tomorrow'
                                ? 'bg-[#1A2F23] text-white shadow-lg'
                                : 'text-zinc-500 hover:text-zinc-900'
                                }`}
                        >
                            Tomorrow
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {loading ? (
                    <div className="min-h-[40vh] flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-zinc-200 border-t-[#1A2F23] rounded-full animate-spin" />
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                showHeritage={true}
                                onBook={() => handleBook(event)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-24 h-24 mb-6 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Silence in the Courtyard</h3>
                        <p className="text-zinc-500 max-w-md mx-auto">
                            No rituals or festivals are scheduled for {activeTab}. The gods are resting.
                        </p>
                    </div>
                )}
            </div>

            {selectedEvent && (
                <BookingModal
                    isOpen={isBookingOpen}
                    onClose={() => setIsBookingOpen(false)}
                    heritageId={selectedEvent.heritage_id}
                    eventId={selectedEvent.id}
                    eventDate={selectedEvent.event_date}
                    title={selectedEvent.title}
                    user={localStorage.getItem('user_role') ? { role: localStorage.getItem('user_role') } : null}
                />
            )}
        </DashboardLayout>
    );
};

export default EventsList;
