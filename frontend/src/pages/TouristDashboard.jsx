import React, { useState, useEffect } from 'react';
import { dashboardAPI, bookingsAPI, paymentsAPI, feedbacksAPI, complaintsAPI } from '../services/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import HeroMetric from '../components/dashboard/HeroMetric';
import StatRow from '../components/dashboard/StatRow';
import BookingRow from '../components/dashboard/BookingRow';
import EmptyState from '../components/dashboard/EmptyState';
import LoadingState from '../components/dashboard/LoadingState';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import PaymentModal from '../components/payments/PaymentModal';
import FeedbackModal from '../components/feedback/FeedbackModal';
import ComplaintModal from '../components/complaints/ComplaintModal';
import ComplaintList from '../components/complaints/ComplaintList';
import AdminComplaintList from '../components/complaints/AdminComplaintList';
import { Check, X, Search, Calendar, Users, Hash, Banknote, AlertCircle } from 'lucide-react'; // Added AlertCircle

const DashboardView = ({ metrics, bookings, role, onAction, paymentStatuses, onRecordPayment, onMarkPaid, reviewedBookings, onLeaveReview, myComplaints, onReportIssue }) => {
    // Sorting & Search
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'complaints'

    // Filter bookings first
    const filteredBookings = (bookings || []).filter(booking => {
        const term = searchTerm.toLowerCase();
        const name = (booking.visitor_name || booking.user?.full_name || '').toLowerCase();
        const ref = (booking.reference_code || '').toLowerCase();
        return name.includes(term) || ref.includes(term);
    });

    // Sort bookings by CREATED AT (Booking Time)
    const sortedBookings = [...filteredBookings].sort((a, b) => {
        const dateA = new Date(a.created_at || a.visit_date); // Fallback to visit_date if created_at missing
        const dateB = new Date(b.created_at || b.visit_date);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [bookings?.length, searchTerm, sortOrder]); // Reset page on filter/sort change

    const itemsToDisplay = sortedBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // --- TOURIST VIEW ---
    if (role === 'tourist') {
        return (
            <>
                <HeroMetric
                    label="Upcoming Trips"
                    value={metrics?.upcoming_bookings || 0}
                    subtitle="Your next adventure awaits"
                />
                <StatRow stats={[
                    { label: 'Total Bookings', value: metrics?.total_bookings || 0 },
                    { label: 'Last Status', value: metrics?.last_booking_status || 'None' },
                ]} />
                <div className="border-t border-[#1A2F23]/10 pt-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <h2 className="text-3xl font-serif text-[#1A2F23]">Recent Bookings</h2>

                        <div className="flex items-center gap-3">
                            {/* Search Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search bookings..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 rounded-lg border border-[#1A2F23]/10 text-sm focus:outline-none focus:border-[#1A2F23]/30 w-48 md:w-64 transition-all"
                                />
                                <Search className="w-4 h-4 text-[#1A2F23]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="appearance-none bg-white border border-[#1A2F23]/10 text-[#1A2F23] text-sm font-bold uppercase tracking-wider py-2 pl-4 pr-10 rounded-lg cursor-pointer focus:outline-none focus:border-[#1A2F23]/30 hover:border-[#1A2F23]/20 transition-colors"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                </select>
                                <svg className="w-4 h-4 text-[#1A2F23]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {bookings.length > 0 ? (
                        itemsToDisplay.length > 0 ? (
                            <div className="space-y-4">
                                {itemsToDisplay.map((booking) => (
                                    <BookingRow
                                        key={booking.id}
                                        booking={booking}
                                        role={role}
                                        paymentStatus={paymentStatuses?.[booking.id]}
                                        isReviewed={!!reviewedBookings?.[booking.id]}
                                        onLeaveReview={onLeaveReview}
                                        onRecordPayment={(booking) => onRecordPayment(booking)}
                                        onReportIssue={(booking) => onReportIssue(booking)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-[#1A2F23]/50">
                                <p>No bookings match your search.</p>
                            </div>
                        )
                    ) : (
                        <EmptyState message="Start exploring heritage sites and make your first booking" />
                    )}

                    {/* Pagination Controls match Admin style below if needed, or keep simple here */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 mt-8">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-full hover:bg-[#E6E4DD] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                ←
                            </button>
                            <span className="text-sm font-bold text-[#1A2F23]/50">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-full hover:bg-[#E6E4DD] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                →
                            </button>
                        </div>
                    )}

                    {/* Complaints Section */}
                    {myComplaints.length > 0 && (
                        <div className="mb-16 mt-12">
                            <h2 className="font-serif text-3xl font-bold text-[#1A2F23] mb-8">My Reports</h2>
                            <ComplaintList complaints={myComplaints} />
                        </div>
                    )}
                </div>
            </>
        );
    }

    // --- GUIDE & ADMIN VIEW (Shared Booking List Style) ---
    const isGuide = role === 'guide';
    const isAdmin = role === 'admin';

    // Admin Specific Stats
    const adminStats = isAdmin ? [
        { label: 'Total Tourists', value: metrics?.total_tourists || 0 },
        { label: 'Total Guides', value: metrics?.total_guides || 0 },
        { label: 'Heritage Sites', value: metrics?.total_heritage || 0 },
        { label: 'Revenue', value: `₹${metrics?.total_revenue || 0}` },
    ] : [];

    // Guide Specific Stats
    const guideStats = isGuide ? [
        { label: 'Total Bookings', value: metrics?.total_bookings || 0 },
        { label: 'Upcoming', value: metrics?.upcoming_bookings || 0 },
        { label: 'Avg Rating', value: metrics?.average_rating ? metrics.average_rating.toFixed(1) : 'N/A' },
        { label: 'Revenue', value: metrics?.total_revenue ? `₹${metrics.total_revenue}` : '₹0' },
    ] : [];

    return (
        <>
            <HeroMetric
                label={isAdmin ? "System Overview" : "Hub Dashboard"}
                value={isAdmin ? (metrics?.total_bookings || 0) : (metrics?.today_bookings || 0)}
                subtitle={isAdmin ? "Total Bookings Managed" : "Active visitors today"}
            />

            <StatRow stats={isAdmin ? adminStats : guideStats} />

            <div className="border-t border-[#1A2F23]/10 pt-12">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-serif text-[#1A2F23]">
                            {isAdmin ? 'System Management' : 'Manage Bookings'}
                        </h2>

                        {/* Admin Tabs */}
                        {isAdmin && (
                            <div className="flex gap-4 mt-6 border-b border-[#1A2F23]/10">
                                <button
                                    onClick={() => setActiveTab('bookings')}
                                    className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'bookings'
                                        ? 'text-[#1A2F23] border-b-2 border-[#1A2F23]'
                                        : 'text-[#1A2F23]/40 hover:text-[#1A2F23]/70'
                                        }`}
                                >
                                    Bookings
                                </button>
                                <button
                                    onClick={() => setActiveTab('complaints')}
                                    className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'complaints'
                                        ? 'text-[#1A2F23] border-b-2 border-[#1A2F23]'
                                        : 'text-[#1A2F23]/40 hover:text-[#1A2F23]/70'
                                        }`}
                                >
                                    Complaints
                                </button>
                            </div>
                        )}

                        {!isAdmin && (
                            <p className="text-[#1A2F23]/60 mt-1">
                                Handle your incoming visitor requests
                            </p>
                        )}
                    </div>

                    {activeTab === 'bookings' && (
                        <div className="flex items-center gap-3">
                            {/* Search Input */}
                            <div className="relative hidden md:block">
                                <input
                                    type="text"
                                    placeholder="Find by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 rounded-full border border-transparent bg-[#E6E4DD] text-[#1A2F23] text-sm font-medium focus:outline-none focus:bg-white focus:border-[#1A2F23]/20 w-48 transition-all"
                                />
                                <Search className="w-4 h-4 text-[#1A2F23]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="appearance-none bg-[#E6E4DD] text-[#1A2F23] text-xs font-bold uppercase tracking-widest py-2 pl-4 pr-10 rounded-full cursor-pointer focus:outline-none hover:bg-[#dcdad3] transition-colors border-none"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                </select>
                                <svg className="w-3 h-3 text-[#1A2F23]/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {bookings.length > 0 && (
                                <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-[#1A2F23]/40 bg-[#E6E4DD] px-3 py-1 rounded-full">
                                    {itemsToDisplay.length}/{filteredBookings.length}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Show Complaints List if Admin and Tab Active */}
                {isAdmin && activeTab === 'complaints' ? (
                    <AdminComplaintList />
                ) : (
                    /* Show Bookings List */
                    bookings.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-6 mb-8">
                                {itemsToDisplay.map((booking) => (
                                    <div key={booking.id} className="group relative bg-[#E6E4DD] rounded-[2rem] p-6 md:p-8 transition-all hover:shadow-lg overflow-hidden">
                                        {/* Decorative */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A2F23]/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-500" />

                                        <div className="relative z-10 flex flex-col lg:flex-row gap-8 justify-between lg:items-center">
                                            <div className="space-y-4 flex-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-xl md:text-2xl font-serif text-[#1A2F23] font-bold">
                                                        {booking.visitor_name || booking.user?.full_name || 'Guest User'}
                                                    </h3>
                                                    {/* Payment Status Badge */}
                                                    {(paymentStatuses?.[booking.id]?.status === 'paid') && (
                                                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest border border-green-200">
                                                            PAID
                                                        </span>
                                                    )}
                                                    {isAdmin && (
                                                        <span className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/50 bg-white px-2 py-1 rounded">
                                                            {booking.heritage?.name}
                                                        </span>
                                                    )}
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${booking.status === 'confirmed' ? 'bg-[#1A2F23] text-[#E6E4DD] border-[#1A2F23]' :
                                                        booking.status === 'cancelled' ? 'bg-transparent text-red-600 border-red-200' :
                                                            'bg-[#BC5A45]/10 text-[#BC5A45] border-[#BC5A45]/20'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                    {/* Booking Type Badge */}
                                                    {booking.event_id ? (
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-purple-100 text-purple-700 border border-purple-200">
                                                            Event Ticket
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                                                            General Entry
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#1A2F23]/70">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 opacity-50" />
                                                        <span className="font-medium">{new Date(booking.visit_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 opacity-50" />
                                                        <span className="font-medium">{booking.people_count} Guest{booking.people_count > 1 ? 's' : ''}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Hash className="w-4 h-4 opacity-50" />
                                                        <span className="font-mono tracking-wider opacity-60 text-xs">{booking.reference_code}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {(booking.status === 'pending' || (isAdmin && booking.status !== 'cancelled')) && (
                                                <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#1A2F23]/10">
                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => onAction('confirm', booking.id)}
                                                            className="flex-1 lg:flex-none px-5 py-2.5 bg-[#1A2F23] text-[#E6E4DD] rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#2C4A3A] hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            Accept
                                                        </button>
                                                    )}
                                                    {booking.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => onAction('cancel', booking.id)}
                                                            className="flex-1 lg:flex-none px-5 py-2.5 bg-white text-red-700 border border-transparent hover:border-red-100 hover:bg-red-50 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <X className="w-3 h-3" />
                                                            {isAdmin ? 'Cancel Booking' : 'Decline'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {/* Record Payment Button for Confirmed Bookings */}
                                            {booking.status === 'confirmed' && paymentStatuses?.[booking.id]?.status !== 'paid' && (
                                                <div className="pt-4 lg:pt-0 border-t lg:border-t-0 border-[#1A2F23]/10">
                                                    {/* If Payment Pending -> Show Mark Paid, Else Record Payment */}
                                                    {paymentStatuses?.[booking.id]?.status === 'pending' ? (
                                                        <button
                                                            onClick={() => onMarkPaid(paymentStatuses[booking.id].id)}
                                                            className="px-5 py-2.5 bg-yellow-100 text-yellow-800 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-yellow-200 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            Confirm Payment
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => onRecordPayment(booking)}
                                                            className="px-5 py-2.5 bg-[#1A2F23] text-[#E6E4DD] rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#2C4A3A] hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Banknote className="w-3 h-3" />
                                                            Record Payment
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-3">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-full hover:bg-[#E6E4DD] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    >
                                        ←
                                    </button>
                                    <span className="text-sm font-bold text-[#1A2F23]/50">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-full hover:bg-[#E6E4DD] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState message="No active bookings found." />
                    )
                )}
            </div>
        </>
    );
};

const TouristDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const role = localStorage.getItem('user_role');

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'confirm', // 'confirm' or 'cancel'
        bookingId: null
    });

    // Payment State
    const [paymentStatuses, setPaymentStatuses] = useState({});
    const [paymentModal, setPaymentModal] = useState({ isOpen: false, booking: null });

    // Feedback State
    const [reviewedBookings, setReviewedBookings] = useState({}); // Map of bookingId -> boolean
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, booking: null });

    // Complaint State
    const [complaintModal, setComplaintModal] = useState({ isOpen: false, booking: null });
    const [myComplaints, setMyComplaints] = useState([]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            let metricsRes;
            if (role === 'guide') metricsRes = await dashboardAPI.getGuideDashboard();
            else if (role === 'admin') metricsRes = await dashboardAPI.getAdminDashboard();
            else metricsRes = await dashboardAPI.getTouristDashboard();

            setMetrics(metricsRes.data);

            let res;
            if (role === 'tourist') {
                res = await dashboardAPI.getMyBookings();
            } else if (role === 'guide') {
                res = await bookingsAPI.getGuideBookings();
            } else if (role === 'admin') {
                res = await bookingsAPI.getAll();
            }
            setBookings(res.data);

            // Fetch Payment Statuses for confirmed bookings
            if (res.data.length > 0) {
                const statusMap = {};
                // We fetch in parallel - optimization: could be moved to backend
                await Promise.all(res.data.map(async (b) => {
                    if (b.status === 'confirmed') { // Only confirmed bookings usually have payments
                        try {
                            const pRes = await paymentsAPI.getStatus(b.id);
                            if (pRes.data) statusMap[b.id] = pRes.data; // Store full payment object
                        } catch (e) {
                            // ignore 404
                        }
                    }
                }));
                setPaymentStatuses(statusMap);
            }

            // Fetch My Feedbacks to determine review status
            if (role === 'tourist') {
                try {
                    const feedbackRes = await feedbacksAPI.getMyFeedbacks();
                    const reviewsMap = {};
                    feedbackRes.data.forEach(f => { reviewsMap[f.booking_id] = true; });
                    setReviewedBookings(reviewsMap);

                    // Fetch My Complaints
                    const complaintsRes = await complaintsAPI.getMyComplaints();
                    setMyComplaints(complaintsRes.data);
                } catch (e) {
                    console.error("Failed to fetch feedbacks or complaints", e);
                }
            }

            setError(null);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [role]);

    const handleActionClick = (type, id) => {
        setModal({
            isOpen: true,
            type,
            bookingId: id
        });
    };

    const handleRecordPayment = (booking) => {
        setPaymentModal({
            isOpen: true,
            booking
        });
    };

    const handleMarkPaid = async (paymentId) => {
        try {
            await paymentsAPI.markPaid(paymentId);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            // Optional: Show toast error
        }
    };

    const handleLeaveReview = (booking) => {
        setFeedbackModal({
            isOpen: true,
            booking
        });
    };

    const handleReportIssue = (booking) => {
        setComplaintModal({
            isOpen: true,
            booking
        });
    };

    const executeAction = async () => {
        try {
            if (modal.type === 'confirm') {
                await bookingsAPI.confirm(modal.bookingId);
            } else {
                await bookingsAPI.cancel(modal.bookingId);
            }
            fetchDashboardData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;
    if (error) return <DashboardLayout><div className="text-center py-20 text-neutral-500">{error}</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <DashboardView
                metrics={metrics}
                bookings={bookings}
                role={role}
                onAction={handleActionClick}
                paymentStatuses={paymentStatuses}
                onRecordPayment={handleRecordPayment}
                onMarkPaid={handleMarkPaid}
                reviewedBookings={reviewedBookings}
                onLeaveReview={handleLeaveReview}
                myComplaints={myComplaints}
                onReportIssue={handleReportIssue}
            />

            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={executeAction}
                title={modal.type === 'confirm' ? "Confirm Booking" : "Cancel Booking"}
                message={modal.type === 'confirm'
                    ? "Are you sure you want to accept this booking request?"
                    : "Are you sure you want to cancel this booking? This action cannot be undone."}
                confirmText={modal.type === 'confirm' ? "Accept Booking" : "Yes, Cancel It"}
                isDanger={modal.type === 'cancel'}
            />

            <PaymentModal
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                booking={paymentModal.booking}
                onSuccess={() => {
                    fetchDashboardData();
                    // Optional toast success
                }}
            />

            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                booking={feedbackModal.booking}
                onSuccess={() => {
                    fetchDashboardData();
                }}
            />
            {/* Complaint Modal */}
            <ComplaintModal
                isOpen={complaintModal.isOpen}
                onClose={() => setComplaintModal({ ...complaintModal, isOpen: false })}
                booking={complaintModal.booking}
                onSuccess={() => {
                    fetchDashboardData();
                    // Optionally show toast
                }}
            />
        </DashboardLayout>
    );
};

export default TouristDashboard;
