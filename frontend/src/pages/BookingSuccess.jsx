import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Copy, ArrowRight, Search } from 'lucide-react';

const BookingSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const reference = searchParams.get('ref');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!reference) {
            navigate('/');
        }
    }, [reference, navigate]);

    const handleCopy = () => {
        navigator.clipboard.writeText(reference);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!reference) return null;

    return (
        <div className="min-h-screen bg-[#1A2F23] flex items-center justify-center p-6 selection:bg-[#BC5A45] selection:text-white relative overflow-hidden">

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
            </div>

            <div className="max-w-xl w-full bg-[#E6E4DD] rounded-[3rem] p-12 text-center relative z-10 shadow-2xl animate-in fade-in zoom-in duration-500">

                <div className="w-24 h-24 bg-[#1A2F23] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <CheckCircle className="w-12 h-12 text-[#E6E4DD]" />
                </div>

                <h1 className="font-serif text-4xl md:text-5xl text-[#1A2F23] mb-4">Request Sent!</h1>
                <p className="text-[#1A2F23]/70 text-lg mb-10 leading-relaxed font-light">
                    Your journey is one step closer. We've received your booking request and it is currently pending confirmation.
                </p>

                <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-[#1A2F23]/5">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/40 mb-3">Booking Reference</p>
                    <div className="flex items-center justify-center gap-4 group cursor-pointer" onClick={handleCopy}>
                        <span className="font-serif text-3xl md:text-4xl font-bold text-[#1A2F23] tracking-wider selection:bg-transparent">
                            {reference}
                        </span>
                        <div className={`p-2 rounded-full transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-[#1A2F23]/5 text-[#1A2F23]/40 group-hover:bg-[#1A2F23] group-hover:text-white'}`}>
                            {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </div>
                    </div>
                    <p className="text-xs text-[#1A2F23]/40 mt-4 italic">
                        {copied ? 'Copied to clipboard!' : 'Click to copy code'}
                    </p>
                </div>

                <div className="grid gap-4">
                    <Link
                        to={`/track-booking?ref=${reference}`}
                        className="w-full bg-[#1A2F23] text-[#E6E4DD] py-5 rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                        <Search className="w-5 h-5" />
                        Track Status
                    </Link>

                    <Link
                        to="/"
                        className="w-full bg-transparent border-2 border-[#1A2F23]/10 text-[#1A2F23] py-5 rounded-2xl font-bold uppercase tracking-widest hover:border-[#1A2F23] hover:bg-[#1A2F23]/5 transition-all flex items-center justify-center gap-3"
                    >
                        Back to Home
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default BookingSuccess;
