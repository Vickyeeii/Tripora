import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, User, Mail, Phone, FileText, CheckCircle } from 'lucide-react';
import { bookingsAPI } from '../../services/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

const BookingModal = ({ isOpen, onClose, heritageId, eventId, eventDate, title, user }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [referenceCode, setReferenceCode] = useState('');

    const [bookingType, setBookingType] = useState('heritage'); // 'heritage' | 'event'

    const [formData, setFormData] = useState({
        visitor_name: '',
        visitor_email: '',
        visitor_phone: '',
        visit_date: new Date(),
        visit_time: null,
        people_count: 1,
        notes: ''
    });

    // Initialize state when modal opens
    useEffect(() => {
        if (isOpen) {
            // Determine initial type based on props
            // If eventId provided, default to 'event', otherwise 'heritage'
            const initialType = eventId ? 'event' : 'heritage';
            setBookingType(initialType);

            setFormData(prev => ({
                ...prev,
                // Lock date only if it's an event booking
                visit_date: (initialType === 'event' && eventDate) ? new Date(eventDate) : (prev.visit_date || new Date()),
                visitor_name: user?.full_name || prev.visitor_name,
                visitor_email: user?.email || prev.visitor_email,
                visitor_phone: user?.phone || prev.visitor_phone
            }));
        }
    }, [user, isOpen, eventId, eventDate]);

    // Handle Type Toggle
    const handleTypeChange = (type) => {
        setBookingType(type);
        if (type === 'event' && eventDate) {
            // Lock back to event date
            setFormData(prev => ({ ...prev, visit_date: new Date(eventDate) }));
        }
        // If switching to heritage, we just leave the date as is (or could reset to today, but keeping current selection is friendly)
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleDateChange = (date) => {
        setFormData(prev => ({ ...prev, visit_date: date }));
    };

    const handleTimeChange = (time) => {
        setFormData(prev => ({ ...prev, visit_time: time }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                heritage_id: heritageId,
                // Only include event_id if booking type is explicitly 'event'
                event_id: bookingType === 'event' ? (eventId || null) : null,
                visitor_name: formData.visitor_name,
                visitor_phone: formData.visitor_phone,
                visitor_email: formData.visitor_email,
                visit_date: format(formData.visit_date, 'yyyy-MM-dd'),
                visit_time: formData.visit_time ? format(formData.visit_time, 'HH:mm:ss') : null,
                people_count: parseInt(formData.people_count),
                notes: formData.notes
            };

            let response;
            if (user && user.role === 'tourist') {
                response = await bookingsAPI.createTourist(payload);
            } else {
                response = await bookingsAPI.createPublic(payload);
            }

            setReferenceCode(response.data.reference_code);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Booking failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2F23]/80 backdrop-blur-md">
                <div className="bg-[#E6E4DD] rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500 border border-white/20">
                    <div className="p-8 text-center relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#1A2F23]/5 to-transparent pointer-events-none" />

                        <div className="relative inline-flex mb-6">
                            <div className="absolute inset-0 bg-[#1A2F23]/10 rounded-full blur-xl animate-pulse" />
                            <div className="w-20 h-20 bg-[#1A2F23] rounded-full flex items-center justify-center relative z-10 shadow-lg shadow-[#1A2F23]/20">
                                <CheckCircle className="w-10 h-10 text-[#E6E4DD]" />
                            </div>
                        </div>

                        <h3 className="font-serif text-3xl text-[#1A2F23] mb-3 font-medium">Request Received</h3>
                        <p className="text-[#1A2F23]/60 mb-8 max-w-[280px] mx-auto text-sm leading-relaxed">
                            Your journey to <span className="font-bold text-[#1A2F23]">{title}</span> awaits confirmation.
                        </p>

                        <div className="bg-white rounded-2xl p-6 mb-8 text-left border border-[#1A2F23]/5 shadow-sm">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A2F23]/40 font-bold mb-2">Reference Code</p>
                            <div className="flex justify-between items-end group cursor-pointer" onClick={() => navigator.clipboard.writeText(referenceCode)}>
                                <p className="text-3xl font-serif text-[#1A2F23] tracking-wider relative">
                                    {referenceCode}
                                    <span className="block h-0.5 bg-[#BC5A45] w-0 group-hover:w-full transition-all duration-300" />
                                </p>
                                <span className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/40 group-hover:text-[#BC5A45] transition-colors mb-1">
                                    Copy
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setSuccess(false);
                                onClose();
                            }}
                            className="w-full bg-[#1A2F23] text-[#E6E4DD] py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#2C4A3A] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#1A2F23]/10"
                        >
                            Return to Site
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1A2F23]/90 backdrop-blur-md transition-opacity">
            <div
                className="bg-[#E6E4DD] rounded-[2.5rem] w-full max-w-5xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col md:flex-row max-h-[90vh] md:h-[650px] animate-in fade-in zoom-in-95 duration-500"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Left Side - Visual / Branding */}
                <div className="hidden md:flex md:w-[40%] bg-[#1A2F23] relative flex-col justify-between p-10 lg:p-12 text-[#E6E4DD] overflow-hidden">
                    {/* Background Elements */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] mix-blend-overlay" />
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#BC5A45] rounded-full blur-[100px] opacity-40 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8 opacity-60">
                            <div className="w-8 h-[1px] bg-[#E6E4DD]" />
                            <span className="text-xs font-bold uppercase tracking-[0.3em]">{bookingType === 'event' ? 'Event Ticket' : 'General Entry'}</span>
                        </div>
                        <h3 className="font-serif text-5xl lg:text-6xl mb-6 leading-[0.9]">
                            {bookingType === 'event' ? 'Secure Your' : 'Book Your'}<br />
                            <span className="italic text-[#BC5A45] opacity-90">{bookingType === 'event' ? 'Spot.' : 'Experience.'}</span>
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed max-w-[260px] font-light border-l border-white/20 pl-4">
                            Secure your visit to {title}. Immerse yourself in the echoes of the past.
                        </p>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-6 mt-auto">
                        <div className="space-y-1">
                            <span className="block text-2xl font-serif">Instant</span>
                            <span className="text-[10px] uppercase tracking-widest opacity-50 block">Booking</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-2xl font-serif">Curated</span>
                            <span className="text-[10px] uppercase tracking-widest opacity-50 block">Experience</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-[60%] flex flex-col h-full bg-[#f4f3f0] relative">
                    {/* Mobile Header Image/Gradient */}
                    <div className="md:hidden h-24 bg-[#1A2F23] p-6 flex flex-col justify-center relative overflow-hidden shrink-0">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#BC5A45] rounded-full blur-[50px] opacity-30" />
                        <span className="text-[#E6E4DD]/60 text-xs font-bold uppercase tracking-widest relative z-10">Request Visit</span>
                        <h2 className="text-white font-serif text-2xl relative z-10">{title}</h2>
                    </div>

                    <div className="flex justify-between items-center px-8 py-6 border-b border-[#1A2F23]/5 bg-white/50 backdrop-blur-sm sticky top-0 z-30 shrink-0">
                        <h3 className="hidden md:block font-serif text-2xl text-[#1A2F23]">Request Booking</h3>
                        <button
                            onClick={onClose}
                            className="group p-2 -mr-2 hover:bg-[#1A2F23]/5 rounded-full transition-all"
                        >
                            <X className="w-6 h-6 text-[#1A2F23]/40 group-hover:text-[#1A2F23] transition-colors" />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1 p-6 md:p-10 space-y-8 scrollbar-hide">
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                                <span className="text-lg">•</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Booking Type Selector (Only if eventId is available to choose from) */}
                            {eventId && (
                                <div className="bg-white p-2 rounded-xl border border-[#1A2F23]/5 flex gap-2 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('event')}
                                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${bookingType === 'event' ? 'bg-[#1A2F23] text-[#E6E4DD] shadow-md' : 'bg-transparent text-[#1A2F23]/40 hover:bg-[#1A2F23]/5'}`}
                                    >
                                        Event
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('heritage')}
                                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${bookingType === 'heritage' ? 'bg-[#1A2F23] text-[#E6E4DD] shadow-md' : 'bg-transparent text-[#1A2F23]/40 hover:bg-[#1A2F23]/5'}`}
                                    >
                                        Visit
                                    </button>
                                </div>
                            )}

                            {/* Section 1: Contact */}
                            <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2F23]/40 flex items-center gap-3">
                                    <span className="w-6 h-[1px] bg-[#1A2F23]/20"></span>
                                    Guest Details
                                    <span className="flex-1 h-[1px] bg-[#1A2F23]/20"></span>
                                </h4>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A2F23]/30 group-focus-within:text-[#BC5A45] transition-colors" />
                                        <input
                                            type="text"
                                            name="visitor_name"
                                            value={formData.visitor_name}
                                            onChange={handleChange}
                                            placeholder="Your Full Name"
                                            required
                                            className="w-full pl-11 pr-4 py-4 bg-white border-b-2 border-[#1A2F23]/5 focus:border-[#BC5A45] rounded-t-lg transition-all outline-none placeholder:text-[#1A2F23]/30 text-[#1A2F23] font-medium"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A2F23]/30 group-focus-within:text-[#BC5A45] transition-colors" />
                                            <input
                                                type="tel"
                                                name="visitor_phone"
                                                value={formData.visitor_phone}
                                                onChange={handleChange}
                                                placeholder="Phone Number"
                                                required
                                                className="w-full pl-11 pr-4 py-4 bg-white border-b-2 border-[#1A2F23]/5 focus:border-[#BC5A45] rounded-t-lg transition-all outline-none placeholder:text-[#1A2F23]/30 text-[#1A2F23]"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A2F23]/30 group-focus-within:text-[#BC5A45] transition-colors" />
                                            <input
                                                type="email"
                                                name="visitor_email"
                                                value={formData.visitor_email}
                                                onChange={handleChange}
                                                placeholder="Email (Optional)"
                                                className="w-full pl-11 pr-4 py-4 bg-white border-b-2 border-[#1A2F23]/5 focus:border-[#BC5A45] rounded-t-lg transition-all outline-none placeholder:text-[#1A2F23]/30 text-[#1A2F23]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Visit */}
                            <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500 delay-200">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2F23]/40 flex items-center gap-3">
                                    <span className="w-6 h-[1px] bg-[#1A2F23]/20"></span>
                                    Visit Preferences
                                    <span className="flex-1 h-[1px] bg-[#1A2F23]/20"></span>
                                </h4>

                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#1A2F23]/5 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative group">
                                            <label className="text-[10px] uppercase tracking-wider text-[#1A2F23]/40 font-bold mb-1.5 block ml-1">Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A2F23]/40 z-10" />
                                                <DatePicker
                                                    selected={formData.visit_date}
                                                    onChange={handleDateChange}
                                                    // Disable only if booking type is event and eventDate is set
                                                    disabled={bookingType === 'event' && !!eventDate}
                                                    readOnly={bookingType === 'event' && !!eventDate}
                                                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg text-sm text-[#1A2F23] font-medium outline-none transition-all ${(bookingType === 'event' && eventDate) ? 'bg-[#1A2F23]/5 cursor-not-allowed opacity-70' : 'bg-[#f4f3f0] focus:ring-2 ring-[#BC5A45]/20 cursor-pointer'}`}
                                                    dateFormat="EEE, MMM d, yyyy"
                                                    minDate={new Date()}
                                                />
                                                {(bookingType === 'event' && eventDate) && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-[#1A2F23]/40">Fixed Date</span>}
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <label className="text-[10px] uppercase tracking-wider text-[#1A2F23]/40 font-bold mb-1.5 block ml-1">Time</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A2F23]/40 z-10" />
                                                <DatePicker
                                                    selected={formData.visit_time}
                                                    onChange={handleTimeChange}
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    timeIntervals={30}
                                                    timeCaption="Time"
                                                    dateFormat="h:mm aa"
                                                    placeholderText="Select Time"
                                                    className="w-full pl-10 pr-3 py-2.5 bg-[#f4f3f0] rounded-lg text-sm text-[#1A2F23] font-medium outline-none focus:ring-2 ring-[#BC5A45]/20 transition-all cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-dashed border-[#1A2F23]/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#1A2F23]/5 flex items-center justify-center text-[#1A2F23]/60">
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#1A2F23]">Total Guests</p>
                                                    <p className="text-[10px] text-[#1A2F23]/50 uppercase tracking-wide">Including Yourself</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center bg-[#f4f3f0] rounded-full p-1">
                                                <button type="button" onClick={() => setFormData(p => ({ ...p, people_count: Math.max(1, p.people_count - 1) }))} className="w-8 h-8 flex items-center justify-center text-[#1A2F23]/60 hover:bg-white hover:shadow-sm rounded-full transition-all text-lg font-bold">-</button>
                                                <input
                                                    type="number"
                                                    value={formData.people_count}
                                                    readOnly
                                                    className="w-10 text-center bg-transparent font-bold text-[#1A2F23] outline-none"
                                                />
                                                <button type="button" onClick={() => setFormData(p => ({ ...p, people_count: Math.min(50, p.people_count + 1) }))} className="w-8 h-8 flex items-center justify-center text-[#1A2F23]/60 hover:bg-white hover:shadow-sm rounded-full transition-all text-lg font-bold">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white px-5 py-4 rounded-xl border2 border-[#1A2F23]/5 focus-within:ring-2 ring-[#BC5A45]/10 transition-all">
                                    <textarea
                                        name="notes"
                                        rows="2"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Any special requests? (e.g. Accessibility needs)"
                                        className="w-full bg-transparent outline-none text-sm placeholder:text-[#1A2F23]/30 text-[#1A2F23] resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 md:p-8 bg-white border-t border-[#1A2F23]/5 shrink-0 sticky bottom-0 z-30">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full flex items-center justify-between px-8 py-4 bg-[#1A2F23] text-[#E6E4DD] rounded-xl group hover:bg-[#2C4A3A] transition-all disabled:opacity-50 disabled:hover:bg-[#1A2F23] shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
                        >
                            <span className="font-bold uppercase tracking-widest text-sm">
                                {loading ? 'Confirming...' : 'Confirm Request'}
                            </span>
                            <span className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all">
                                <FileText className="w-4 h-4" />
                            </span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BookingModal;
