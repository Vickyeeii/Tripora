import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Toast from '../components/ui/Toast';

const PendingGuides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchPendingGuides();
  }, []);

  const fetchPendingGuides = async () => {
    try {
      const response = await usersAPI.getPendingGuides();
      setGuides(response.data);
    } catch (error) {
      setToast({ message: 'Failed to load pending guides', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (guideId, approve) => {
    try {
      await usersAPI.approveGuide(guideId, approve);
      setToast({
        message: approve ? 'Application approved' : 'Application rejected',
        type: 'success'
      });
      fetchPendingGuides();
    } catch (error) {
      setToast({ message: 'Failed to update guide status', type: 'error' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Pending Approvals</h1>
          <p className="text-sm text-zinc-500 mt-1">Review and action guide applications.</p>
        </div>

        {guides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-50 rounded-xl border border-zinc-100 border-dashed">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">All Caught Up</h3>
            <p className="text-xs text-zinc-500 mt-1">No pending applications at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {guides.map((guide) => (
              <div
                key={guide.id}
                className="flex flex-col bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Header: Identity & Status */}
                <div className="p-5 sm:p-6 border-b border-zinc-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-zinc-100 flex items-center justify-center text-base sm:text-lg font-bold text-zinc-700 border border-zinc-200 shrink-0">
                        {guide.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-zinc-900 leading-snug truncate pr-2">{guide.full_name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] sm:text-xs text-zinc-500 font-medium bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100 truncate">
                            Applied {new Date(guide.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="self-start sm:self-auto px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] sm:text-xs uppercase font-bold tracking-wider border border-amber-100/50 shrink-0">
                      Pending
                    </span>
                  </div>

                  {/* Tabular Details */}
                  <div className="space-y-3 mt-2 sm:mt-4">
                    <div className="flex items-center text-sm">
                      <span className="text-zinc-500 font-medium w-20 shrink-0 text-xs sm:text-sm">Email</span>
                      <span className="text-zinc-900 truncate font-medium text-xs sm:text-sm">{guide.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-zinc-500 font-medium w-20 shrink-0 text-xs sm:text-sm">Phone</span>
                      <span className="text-zinc-900 truncate text-xs sm:text-sm">{guide.phone || '—'}</span>
                    </div>
                    <div className="flex items-start text-sm">
                      <span className="text-zinc-500 font-medium w-20 shrink-0 mt-0.5 text-xs sm:text-sm">Address</span>
                      <span className="text-zinc-900 truncate leading-relaxed text-xs sm:text-sm" title={guide.address}>{guide.address || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="mt-auto p-4 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => handleApproval(guide.id, false)}
                    className="flex-1 px-4 py-3 sm:py-2.5 bg-white border border-zinc-300 shadow-sm text-zinc-700 text-sm font-bold rounded-lg hover:bg-zinc-50 hover:border-zinc-400 hover:text-zinc-900 transition-all focus:ring-2 focus:ring-zinc-200 focus:outline-none order-2 sm:order-1"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleApproval(guide.id, true)}
                    className="flex-1 px-4 py-3 sm:py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-lg hover:bg-zinc-800 shadow-sm transition-all focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 focus:outline-none order-1 sm:order-2"
                  >
                    Approve Guide
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PendingGuides;
