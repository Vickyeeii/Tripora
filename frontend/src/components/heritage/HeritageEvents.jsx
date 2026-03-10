import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../../services/api';
import EventCard from '../events/EventCard';
import { useToast } from '../ui/ToastProvider';

const HeritageEvents = ({ heritageId, canManage = false, onManage }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showError } = useToast();

    useEffect(() => {
        if (heritageId) {
            fetchEvents();
        }
    }, [heritageId]);

    const fetchEvents = async () => {
        try {
            const response = await eventsAPI.getByHeritage(heritageId);
            setEvents(response.data);
        } catch (error) {
            // showError('Failed to load events');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6 mt-10">
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
                    <span className="w-8 h-1 bg-zinc-900 rounded-full inline-block"></span>
                    Upcoming Events
                </h2>

                {canManage && (
                    <button
                        onClick={onManage}
                        className="text-sm font-bold text-zinc-900 px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                        Manage Events
                    </button>
                )}
            </div>

            {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="bg-zinc-50 rounded-2xl p-8 text-center border border-zinc-100 border-dashed">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <svg className="w-6 h-6 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-zinc-500 font-medium">No upcoming events scheduled for this site.</p>
                    {canManage && <p className="text-xs text-zinc-400 mt-1">Click "Manage Events" to add one.</p>}
                </div>
            )}
        </div>
    );
};

export default HeritageEvents;
