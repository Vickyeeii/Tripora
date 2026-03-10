import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event, showHeritage = false, onBook }) => {
    const typeColors = {
        festival: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        ritual: 'bg-amber-100 text-amber-800 border-amber-200',
        notice: 'bg-blue-100 text-blue-800 border-blue-200',
        alert: 'bg-red-100 text-red-800 border-red-200',
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    const imageUrl = event.heritage?.photos?.[0]?.image_url;
    const eventDate = new Date(event.event_date);

    return (
        <div className="group flex flex-col h-[500px] bg-white rounded-4xl overflow-hidden border border-zinc-200/60 shadow-sm hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2">

            {/* --- IMAGE SECTION (55%) --- */}
            <div className="relative h-[55%] w-full overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={event.heritage?.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                )}

                {/* Overlay Gradient at bottom of image for badge legibility if needed, 
                    but we are using floating badges so maybe not needed. Keep it clean. */}

                {/* Date Badge - Floating Top Right */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg flex flex-col items-center border border-white/50">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                        {eventDate.toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-2xl font-serif font-bold text-[#1A2F23] leading-none mt-1">
                        {eventDate.getDate()}
                    </span>
                </div>

                {/* Type Badge - Floating Top Left */}
                <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${typeColors[event.event_type] || 'bg-gray-100 text-gray-800'}`}>
                    {event.event_type}
                </span>

                {/* Heritage Label - Floating Bottom Left */}
                {showHeritage && event.heritage && (
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                        <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider max-w-[150px] truncate">
                            {event.heritage.name}
                        </span>
                    </div>
                )}
            </div>

            {/* --- CONTENT SECTION (45%) --- */}
            <div className="flex flex-col grow p-6 relative">
                {/* Decorative Line */}
                <div className="w-12 h-1 bg-[#BC5A45] rounded-full mb-4 opacity-50"></div>

                <div className="grow">
                    <h3 className="text-2xl font-serif font-bold text-[#1A2F23] mb-3 leading-tight group-hover:text-[#BC5A45] transition-colors line-clamp-2">
                        {event.title}
                    </h3>

                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3">
                        {event.description}
                    </p>
                </div>

                {/* Footer Meta */}
                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>
                            {event.start_time ? formatTime(event.start_time) : 'All Day'}
                            {event.end_time && ` - ${formatTime(event.end_time)} `}
                        </span>
                    </div>

                    {showHeritage && onBook && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onBook();
                            }}
                            className="px-6 py-2 bg-[#1A2F23] text-white text-[10px] font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#BC5A45] hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
                        >
                            Book Entry
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventCard;
