import React, { useState, useEffect } from 'react';

const EventForm = ({ initialData, heritageId, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        start_time: '',
        end_time: '',
        event_type: 'notice',
        heritage_id: heritageId,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                // Ensure time fields are formatted HH:MM for input[type="time"]
                start_time: initialData.start_time ? initialData.start_time.slice(0, 5) : '',
                end_time: initialData.end_time ? initialData.end_time.slice(0, 5) : '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Clean up empty time strings to null
        const submitData = {
            ...formData,
            start_time: formData.start_time || null,
            end_time: formData.end_time || null,
        };
        onSubmit(submitData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Event Title</label>
                <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
                    placeholder="e.g., Annual Temple Festival"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Event Type</label>
                    <select
                        name="event_type"
                        value={formData.event_type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all appearance-none"
                    >
                        <option value="notice">Notice</option>
                        <option value="festival">Festival</option>
                        <option value="ritual">Ritual</option>
                        <option value="alert">Alert</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Date</label>
                    <input
                        type="date"
                        name="event_date"
                        required
                        value={formData.event_date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Start Time <span className="text-zinc-400 font-normal">(Optional)</span></label>
                    <input
                        type="time"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">End Time <span className="text-zinc-400 font-normal">(Optional)</span></label>
                    <input
                        type="time"
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Description</label>
                <textarea
                    name="description"
                    required
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all resize-none"
                    placeholder="Describe the event details..."
                />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 text-zinc-600 font-bold hover:bg-zinc-50 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-zinc-900 text-white font-bold rounded-lg hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/10 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : initialData ? 'Update Event' : 'Create Event'}
                </button>
            </div>
        </form>
    );
};

export default EventForm;
