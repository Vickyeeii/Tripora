import React, { useState, useEffect } from 'react';
import { complaintsAPI } from '../../services/api';
import { Search, Filter, MessageSquare, CheckCircle, AlertCircle, Clock, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const AdminComplaintList = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const res = await complaintsAPI.getAll();
            setComplaints(res.data);
        } catch (error) {
            console.error("Failed to fetch complaints", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await complaintsAPI.updateStatus(id, newStatus);
            fetchComplaints(); // Refresh list
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleReplySubmit = async (id) => {
        if (!replyText.trim()) return;

        try {
            setSendingReply(true);
            await complaintsAPI.reply(id, replyText);
            setReplyText('');
            fetchComplaints(); // Refresh to show reply
        } catch (error) {
            console.error("Failed to send reply", error);
        } finally {
            setSendingReply(false);
        }
    };

    const toggleExpand = (id) => {
        if (expandedId === id) {
            setExpandedId(null);
            setReplyText('');
        } else {
            setExpandedId(id);
            setReplyText('');
        }
    };

    const filteredComplaints = complaints.filter(c =>
        filterStatus === 'all' ? true : c.status === filterStatus
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-red-100 text-red-700 border-red-200';
            case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading complaints...</div>;

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-serif text-[#1A2F23]">Complaint Management</h2>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-zinc-200">
                    {['all', 'open', 'resolved'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-colors ${filterStatus === status
                                    ? 'bg-[#1A2F23] text-[#E6E4DD]'
                                    : 'text-zinc-500 hover:bg-zinc-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredComplaints.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100">
                        <CheckCircle className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                        <p className="text-zinc-400 font-medium">No complaints found.</p>
                    </div>
                ) : (
                    filteredComplaints.map(complaint => (
                        <div key={complaint.id} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
                            <div
                                onClick={() => toggleExpand(complaint.id)}
                                className="p-6 cursor-pointer flex items-center justify-between hover:bg-zinc-50/50 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${getStatusColor(complaint.status).replace('text-', 'bg-').replace('border-', 'border-transparent ')} bg-opacity-10`}>
                                        <AlertCircle className={`w-6 h-6 ${getStatusColor(complaint.status).split(' ')[1]}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getStatusColor(complaint.status)}`}>
                                                {complaint.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                                {format(parseISO(complaint.created_at), 'MMM d, yyyy')}
                                            </span>
                                            {complaint.reference_code && (
                                                <span className="text-xs font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-500">
                                                    #{complaint.reference_code}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-[#1A2F23]">{complaint.subject}</h3>
                                    </div>
                                </div>
                                <div>
                                    {expandedId === complaint.id ? <ChevronUp className="text-zinc-400" /> : <ChevronDown className="text-zinc-400" />}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedId === complaint.id && (
                                <div className="px-6 pb-6 pt-0 border-t border-zinc-100 bg-zinc-50/30">
                                    <div className="mt-6 space-y-6">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/60 mb-2">Description</h4>
                                            <p className="text-[#1A2F23] leading-relaxed">{complaint.description}</p>
                                        </div>

                                        {/* Admin Reply Section */}
                                        <div className="bg-white p-6 rounded-xl border border-zinc-200">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/60 mb-4 flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4" />
                                                Support Response
                                            </h4>

                                            {complaint.admin_reply ? (
                                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                                    <p className="text-emerald-900">{complaint.admin_reply}</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <textarea
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Type a response to the user..."
                                                        className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A2F23]/20 transition-all text-sm"
                                                        rows="3"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleReplySubmit(complaint.id)}
                                                            disabled={!replyText.trim() || sendingReply}
                                                            className="bg-[#1A2F23] text-[#E6E4DD] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#14241B] transition-colors disabled:opacity-50 flex items-center gap-2"
                                                        >
                                                            {sendingReply ? 'Sending...' : <>Reply <Send className="w-3 h-3" /></>}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Actions</span>
                                            <div className="flex gap-2">
                                                {complaint.status !== 'resolved' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(complaint.id, 'resolved')}
                                                        className="px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold uppercase tracking-widest transition-colors"
                                                    >
                                                        Mark as Resolved
                                                    </button>
                                                )}
                                                {complaint.status !== 'closed' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(complaint.id, 'closed')}
                                                        className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-bold uppercase tracking-widest transition-colors"
                                                    >
                                                        Close Ticket
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminComplaintList;
