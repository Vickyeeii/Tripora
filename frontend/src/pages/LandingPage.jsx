import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import hero from '.././assets/hero3.jpeg';
import img1 from '.././assets/land4.jpeg';
import img2 from '.././assets/land2.jpeg'

const LandingPage = () => {
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    const [searchOpen, setSearchOpen] = useState(false);

    const Navbar = () => (
        <nav className="fixed top-0 left-0 right-0 z-50 py-8 px-8 flex justify-between items-start pointer-events-none mix-blend-difference text-white">
            <div className="pointer-events-auto">
                <span className="text-2xl font-serif font-bold tracking-tight">Tripora.</span>
            </div>
            <div className="pointer-events-auto flex items-center gap-6">
                <button onClick={() => navigate('/heritage')} className="text-xs font-bold uppercase tracking-widest hover:text-emerald-300 transition-colors mr-4">Heritage</button>
                <button onClick={() => navigate('/events')} className="text-xs font-bold uppercase tracking-widest hover:text-emerald-300 transition-colors mr-4">Events</button>
                <button onClick={() => navigate('/track-booking')} className="text-xs font-bold uppercase tracking-widest hover:text-emerald-300 transition-colors mr-4">Track Visit</button>
                {!isAuthenticated ? (
                    <button onClick={() => navigate('/login')} className="text-xs font-bold uppercase tracking-widest hover:text-emerald-300 transition-colors">Login</button>
                ) : (
                    <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">
                        {role?.charAt(0).toUpperCase()}
                    </button>
                )}
                <button
                    onClick={() => setSearchOpen(true)}
                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
            </div>
        </nav>
    );

    return (
        <div className="bg-[#E6E4DD] text-[#1A1A1A] font-sans selection:bg-[#BC5A45] selection:text-white">
            <Navbar />

            {/* --- SEARCH OVERLAY --- */}
            {searchOpen && (
                <div className="fixed inset-0 z-60 bg-[#1A2F23]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-[fade-in-up_0.3s_ease-out]">
                    <button onClick={() => setSearchOpen(false)} className="absolute top-8 right-8 text-white hover:rotate-90 transition-transform">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <h2 className="text-white font-serif text-4xl mb-8">Where is your soul calling?</h2>
                    <div className="w-full max-w-2xl bg-transparent border-b border-white/30 flex items-center pb-4">
                        <input type="text" placeholder="Search Kerala..." className="w-full bg-transparent text-white text-2xl outline-none placeholder:text-white/30 font-serif" />
                        <button className="text-white hover:text-emerald-400 transition-colors">GO</button>
                    </div>
                </div>
            )}

            {/* --- SECTION 1: THE ARCH HERO --- */}
            <section className="relative w-full min-h-screen pt-24 md:pt-32 px-4 pb-12 flex flex-col justify-between overflow-x-hidden">
                <div className="text-center z-10 relative mt-12 md:mt-0">
                    <h1 className="font-serif text-6xl md:text-[15vw] leading-[0.8] text-[#1A2F23]">
                        KERALA
                    </h1>
                    <div className="flex justify-center items-center gap-4 mt-4 md:mt-4">
                        <div className="h-px w-8 md:w-12 bg-[#F4F4F4] md:bg-[#F4F4F4]" />
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-[#F4F4F4]">God's Own Country</p>
                        <div className="h-px w-8 md:w-12 bg-[#F4F4F4] md:bg-[#F4F4F4]" />
                    </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vh] md:w-[40vw] md:h-[60vh] rounded-t-[500px] overflow-hidden z-0">
                    <img
                        src={hero}
                        className="w-full h-full object-cover animate-[scale-in_1.5s_ease-out_forwards]"
                        alt="Kerala Backwaters"
                    />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center md:items-end px-4 z-10 gap-8 md:gap-0 mt-auto md:mt-0">
                    <div className="text-center md:text-left">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#1A2F23] mb-1">Coordinates</p>
                        <p className="font-serif text-[#1A2F23]">10.8505° N, 76.2711° E</p>
                    </div>
                    <button onClick={() => navigate('/heritage')} className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-[#1A2F23]/20 flex items-center justify-center hover:bg-[#1A2F23] hover:text-white transition-all duration-500 group bg-white/50 backdrop-blur-sm md:bg-transparent">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest group-hover:scale-110 transition-transform">Explore</span>
                    </button>
                </div>
            </section>

            {/* --- STICKY STACKING SECTIONS --- */}

            {/* 1. HERITAGE CARD */}
            <section className="relative md:sticky top-0 min-h-screen bg-[#1A2F23] text-[#E6E4DD] flex flex-col md:flex-row shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
                <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center order-2 md:order-1 h-1/2 md:h-full">
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">01 — The Roots</span>
                    <h2 className="font-serif text-5xl md:text-8xl mb-8">Ancient<br />Echoes</h2>
                    <p className="text-[#E6E4DD]/60 text-lg leading-relaxed max-w-md mb-12">
                        Walk through centuries-old forts, temples, and palaces. Our curated heritage sites bring history to life without the dust.
                    </p>
                    <button onClick={() => navigate('/heritage')} className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-full border border-[#E6E4DD]/30 flex items-center justify-center group-hover:bg-[#E6E4DD] group-hover:text-[#1A2F23] transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">View Heritage Sites</span>
                    </button>
                </div>
                <div className="w-full md:w-1/2 h-[50vh] md:h-full order-1 md:order-2">
                    <img src={img2} className="w-full h-full object-cover" alt="Heritage" />
                </div>
            </section>

            {/* 2. EVENTS CARD */}
            <section className="relative md:sticky top-0 min-h-screen bg-[#2A2A2A] text-[#F4F4F4] flex flex-col md:flex-row shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
                <div className="w-full md:w-1/2 h-[50vh] md:h-full order-1 md:order-1">
                    <img src={img1} className="w-full h-full object-cover" alt="Culture" />
                </div>
                <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center order-2 md:order-2 h-1/2 md:h-full">
                    <span className="text-[#F4F4F4] text-xs font-bold uppercase tracking-widest mb-6">02 — The Pulse</span>
                    <h2 className="font-serif text-5xl md:text-8xl mb-8">Living<br />Culture</h2>
                    <p className="text-[#E6E4DD]/80 text-lg leading-relaxed max-w-md mb-12">
                        Witness the divine dance of Theyyam, the rhythm of boat races, and the quiet devotion of temple festivals. Live it as it happens.
                    </p>
                    <button onClick={() => navigate('/events')} className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-full border border-[#E6E4DD]/30 flex items-center justify-center group-hover:bg-[#E6E4DD] group-hover:text-[#BC5A45] transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Find Events</span>
                    </button>
                </div>
            </section>

            {/* 3. FILM STRIP DESTINATIONS */}
            <section className="relative py-32 bg-[#E6E4DD] text-[#2A2A2A]">
                <div className="px-8 mb-16 flex justify-between items-end">
                    <h2 className="font-serif text-5xl md:text-7xl">The Edit.</h2>
                    <p className="text-xs font-bold uppercase tracking-widest">Curated for 2026</p>
                </div>

                <div className="flex overflow-x-auto gap-8 px-8 pb-12 scrollbar-none">
                    {[
                        { name: "Munnar", img: "https://plus.unsplash.com/premium_photo-1674019234981-036f884baf0d?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop", desc: "The High Ranges" },
                        { name: "Varkala", img: "https://images.unsplash.com/photo-1645839451276-7a4b26a254f8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop", desc: "Cliff & Sea" },
                        { name: "Alleppey", img: "https://images.unsplash.com/photo-1704365159747-1f7b8913044f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8QWxsZXBwZXl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop", desc: "Backwaters" },
                        { name: "Kochi", img: "https://images.unsplash.com/photo-1695692929091-cdafc96ec082?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fEtvY2hpfGVufDB8fDB8fHww&auto=format&fit=crop", desc: "The Port City" },
                        { name: "Wayanad", img: "https://images.unsplash.com/photo-1723709431768-d749b0d814b9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop", desc: "Wilderness" }
                    ].map((item, i) => (
                        <div key={i} className="min-w-[300px] h-[500px] relative group cursor-pointer" onClick={() => navigate('/heritage')}>
                            <div className="w-full h-full overflow-hidden">
                                <img src={item.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" alt={item.name} />
                            </div>
                            <div className="absolute bottom-6 left-6 mix-blend-difference text-white">
                                <span className="block text-[10px] font-bold uppercase tracking-widest mb-1">{item.desc}</span>
                                <h3 className="font-serif text-4xl">{item.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
