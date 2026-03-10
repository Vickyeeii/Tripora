import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { eventsAPI, heritageAPI } from '../services/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import EventForm from '../components/events/EventForm';
import { useToast } from '../components/ui/ToastProvider';
import ConfirmModal from '../components/ui/ConfirmModal';

const ManageEvents = () => {
    const { heritageId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError } = useToast();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [heritageName, setHeritageName] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    // If navigating from edit button, we might have an eventId in state or query
    // For now, let's assume this page is /heritage/:heritageId/events

    useEffect(() => {
        fetchData();
    }, [heritageId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventsRes, heritageRes] = await Promise.all([
                eventsAPI.getByHeritage(heritageId),
                heritageAPI.getById(heritageId)
            ]);
            setEvents(eventsRes.data);
            setHeritageName(heritageRes.data.name);
        } catch (error) {
            // showError('Failed to load data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        try {
            setLoading(true);
            const response = await eventsAPI.create(formData);
            setEvents(prev => [...prev, response.data]);
            showSuccess('Event created successfully');
            setIsEditing(false);
        } catch (error) {
            showError(error.response?.data?.detail || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (formData) => {
        try {
            setLoading(true);
            const response = await eventsAPI.update(currentEvent.id, formData);
            setEvents(prev => prev.map(event => event.id === currentEvent.id ? response.data : event));
            showSuccess('Event updated successfully');
            setIsEditing(false);
            setCurrentEvent(null);
        } catch (error) {
            showError(error.response?.data?.detail || 'Failed to update event');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId) => {
        try {
            await eventsAPI.delete(eventId);
            setEvents(prev => prev.filter(event => event.id !== eventId));
            showSuccess('Event deleted successfully');
        } catch (error) {
            showError(error.response?.data?.detail || 'Failed to delete event');
        }
    };

    const handleCancel = async (eventId) => {
        try {
            const response = await eventsAPI.cancel(eventId);
            setEvents(prev => prev.map(event => event.id === eventId ? response.data : event));
            showSuccess('Event cancelled successfully');
        } catch (error) {
            showError(error.response?.data?.detail || 'Failed to cancel event');
        }
    };

    const startEdit = (event) => {
        setCurrentEvent(event);
        setIsEditing(true);
    };

    return (
        <DashboardLayout>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false })}
                onConfirm={confirmModal.action}
                title={confirmModal.title}
                description={confirmModal.description}
                confirmText={confirmModal.confirmText}
                confirmStyle="danger"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/heritage/${heritageId}`)}
                        className="text-sm font-bold text-zinc-500 hover:text-zinc-900 mb-4 flex items-center gap-2"
                    >
                        &larr; Back to {heritageName || 'Heritage Site'}
                    </button>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
                        {isEditing ? (currentEvent ? 'Edit Event' : 'Create New Event') : 'Manage Events'}
                    </h1>
                    <p className="text-zinc-500 text-lg mt-2">
                        {heritageName && `For ${heritageName}`}
                    </p>
                </div>

                {isEditing ? (
                    <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
                        <EventForm
                            initialData={currentEvent}
                            heritageId={heritageId}
                            onSubmit={currentEvent ? handleUpdate : handleCreate}
                            onCancel={() => { setIsEditing(false); setCurrentEvent(null); }}
                            loading={loading}
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full py-4 border-2 border-dashed border-zinc-300 rounded-2xl flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 hover:bg-zinc-50 transition-all group"
                        >
                            <span className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-2 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </span>
                            <span className="font-bold">Create New Event</span>
                        </button>

                        <div className="space-y-4">
                            {events.map(event => (
                                <div key={event.id} className="bg-white p-6 rounded-2xl border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${event.event_type === 'festival' ? 'bg-purple-100 text-purple-700' :
                                                event.event_type === 'ritual' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-700'
                                                }`}>
                                                {event.event_type}
                                            </span>
                                            {!event.is_active && (
                                                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700">
                                                    Cancelled
                                                </span>
                                            )}
                                            <span className="text-sm font-bold text-zinc-400">
                                                {new Date(event.event_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-zinc-900">{event.title}</h3>
                                    </div>

                                    <div className="flex items-center gap-3 flex-wrap">
                                        <button
                                            onClick={() => startEdit(event)}
                                            className="px-4 py-2 bg-zinc-100 text-zinc-900 text-sm font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setConfirmModal({
                                                isOpen: true,
                                                title: 'Delete Event',
                                                description: 'Are you sure you want to delete this event? This action cannot be undone.',
                                                confirmText: 'Delete',
                                                action: () => handleDelete(event.id)
                                            })}
                                            className="px-4 py-2 border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            Delete
                                        </button>
                                        {event.is_active && (
                                            <button
                                                onClick={() => setConfirmModal({
                                                    isOpen: true,
                                                    title: 'Cancel Event',
                                                    description: 'Are you sure you want to cancel this event? It will remain in the list but marked as cancelled.',
                                                    confirmText: 'Cancel Event',
                                                    action: () => handleCancel(event.id)
                                                })}
                                                className="px-4 py-2 border border-orange-200 text-orange-600 text-sm font-bold rounded-lg hover:bg-orange-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {events.length === 0 && !loading && (
                                <div className="text-center py-12 text-zinc-400 font-medium">
                                    No events found. Create one above.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ManageEvents;
