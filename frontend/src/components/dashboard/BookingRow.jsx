import React from 'react';
import { AlertCircle } from 'lucide-react';

const BookingRow = ({ booking, isCompact = false, paymentStatus, role = 'tourist', isReviewed = false, onLeaveReview, onRecordPayment, onReportIssue }) => {
  const statusColors = {
    pending: 'bg-neutral-100 text-neutral-700',
    confirmed: 'bg-accent-100 text-accent-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex items-center justify-between py-6 border-b border-neutral-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-400 mb-1">
          {booking.reference_code}
        </p>
        <p className="text-lg font-medium text-neutral-900">
          {formatDate(booking.visit_date)}
        </p>

        <div className="flex flex-wrap gap-2 mt-1">
          {/* Event Indicator */}
          {booking.event_id && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
              Event Ticket
            </span>
          )}

          {/* Payment Status */}
          {booking.status === 'confirmed' && (
            (paymentStatus?.status === 'paid' || paymentStatus === 'PAID') ? (
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">
                PAID
              </span>
            ) : (
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200">
                Payment Pending
              </span>
            )
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[booking.status] || statusColors.pending}`}>
          {booking.status}
        </span>

        {/* Leave Review Action */}
        {booking.status === 'confirmed' && !isReviewed && (
          <button
            onClick={() => onLeaveReview(booking)}
            className="text-xs font-bold text-[#1A2F23] underline hover:text-[#1A2F23]/70 transition-colors"
          >
            Leave Review
          </button>
        )}
        {booking.status === 'confirmed' && isReviewed && (
          <span className="text-xs font-bold text-[#1A2F23]/40">
            Reviewed
          </span>
        )}

        {/* Report Issue Action */}
        {role === 'tourist' && (
          <button
            onClick={() => onReportIssue(booking)}
            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Report an Issue"
          >
            <AlertCircle className="w-5 h-5 opacity-70 hover:opacity-100" />
          </button>
        )}
      </div>
    </div >
  );
};

export default BookingRow;
