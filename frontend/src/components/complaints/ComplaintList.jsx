import React from 'react';
import { AlertCircle, CheckCircle, Clock, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const ComplaintList = ({ complaints = [] }) => {
    if (!complaints.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-zinc-200 border-dashed">
                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-zinc-300" />
                </div>
                <h3 className="font-serif text-lg text-zinc-900 mb-1">No Complaints</h3>
                <p className="text-zinc-500 text-sm">You haven't reported any issues.</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-4">
            {complaints.map((complaint) => (
                <div key={complaint.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(complaint.status)}`}>
                                {complaint.status.replace('_', ' ')}
                            </span>
                            <h3 className="font-bold text-zinc-900 text-lg mt-3">{complaint.subject}</h3>
                            <p className="text-xs text-zinc-400 mt-1">
                                Reported on {format(parseISO(complaint.created_at), 'MMM d, yyyy')}
                            </p>
                        </div>
                        {complaint.booking_id && (
                            <div className="text-right">
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Reference</span>
                                <p className="font-mono text-xs font-bold text-zinc-600 mt-1">{complaint.reference_code || "Linked"}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-zinc-50 p-4 rounded-xl text-zinc-600 text-sm leading-relaxed mb-4">
                        {complaint.description}
                    </div>

                    {complaint.admin_reply && (
                        <div className="pl-4 border-l-2 border-zinc-900">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-900 mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Admin Response
                            </p>
                            <p className="text-zinc-700 text-sm italic">
                                "{complaint.admin_reply}"
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ComplaintList;
