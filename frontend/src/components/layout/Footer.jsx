import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-[#1A2F23] border-t border-[#E6E4DD]/10 pt-24 pb-12 text-[#E6E4DD]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-3xl font-serif font-bold text-[#E6E4DD]">Tripora.</span>
                        </div>
                        <p className="text-[#E6E4DD]/60 text-sm leading-relaxed font-light">
                            We curate the soul of India. From the misty hills of Munnar to the silent backwaters of Alleppey.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-widest text-[#E6E4DD]/40 mb-8">Explore</h4>
                        <ul className="space-y-4 text-sm text-[#E6E4DD]">
                            <li><a href="/heritage" className="hover:text-emerald-400 transition-colors">Heritage Sites</a></li>
                            <li><a href="/events" className="hover:text-emerald-400 transition-colors">Cultural Events</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Local Guides</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Our Journal</a></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-widest text-[#E6E4DD]/40 mb-8">Company</h4>
                        <ul className="space-y-4 text-sm text-[#E6E4DD]">
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Manifesto</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-widest text-[#E6E4DD]/40 mb-8">Newsletter</h4>
                        <div className="flex flex-col gap-4">
                            <p className="text-xs text-[#E6E4DD]/60">Join the journey. No spam, just stories.</p>
                            <div className="flex border-b border-[#E6E4DD]/20 pb-2">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="bg-transparent w-full outline-none placeholder:text-[#E6E4DD]/20 text-[#E6E4DD]"
                                />
                                <button className="text-[#E6E4DD] text-xs font-bold uppercase hover:text-emerald-400 transition-colors">
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#E6E4DD]/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[#E6E4DD]/40">© 2026 Tripora Inc.</p>
                    <div className="flex gap-6">
                        <a href="#" className="text-[#E6E4DD]/60 hover:text-[#E6E4DD]"><span className="sr-only">Instagram</span>IG</a>
                        <a href="#" className="text-[#E6E4DD]/60 hover:text-[#E6E4DD]"><span className="sr-only">Twitter</span>TW</a>
                        <a href="#" className="text-[#E6E4DD]/60 hover:text-[#E6E4DD]"><span className="sr-only">LinkedIn</span>LI</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
