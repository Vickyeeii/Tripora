import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { heritageAPI, feedbacksAPI } from '../services/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import HeritageEvents from '../components/heritage/HeritageEvents';
import { useToast } from '../components/ui/ToastProvider';
import ConfirmModal from '../components/ui/ConfirmModal';
import BookingModal from '../components/bookings/BookingModal';
import FeedbackList from '../components/feedback/FeedbackList';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SectionHeading = ({ children }) => (
  <h2 className="text-3xl font-serif font-bold text-[#1A2F23] mt-12 mb-6 flex items-center gap-3">
    {children}
  </h2>
);

const DetailItem = ({ icon, label, text }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-colors">
    <div className="text-zinc-900 shrink-0 mt-1">{icon}</div>
    <div>
      <h3 className="text-sm font-semibold text-zinc-900 mb-1">{label}</h3>
      <p className="text-zinc-600 leading-relaxed text-sm">{text}</p>
    </div>
  </div>
);

const HeritageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();

  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null });
  const [generatingQR, setGeneratingQR] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  const role = localStorage.getItem('user_role');

  const user = {
    role: role,
    full_name: '',
    email: '',
    phone: ''
  };

  useEffect(() => {
    fetchSite();
  }, [id, location.state?.refresh]);

  const fetchSite = async () => {
    try {
      const response = await heritageAPI.getById(id);
      setSite(response.data);
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Heritage site not found';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await feedbacksAPI.getHeritageFeedbacks(id);
        setFeedbacks(res.data);
      } catch (e) {
        console.error("Failed to load feedbacks", e);
      }
    };
    if (id) fetchFeedbacks();
  }, [id]);

  const handleApprove = async () => {
    try {
      await heritageAPI.approve(site.id);
      showSuccess('Heritage site approved successfully');
      fetchSite();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to approve site');
    }
  };

  const handleDisable = async () => {
    try {
      await heritageAPI.disable(site.id);
      showSuccess('Heritage site disabled successfully');
      fetchSite();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to disable site');
    }
  };

  const handleDelete = async () => {
    try {
      await heritageAPI.delete(site.id);
      showSuccess('Heritage site deleted successfully');
      setTimeout(() => navigate('/heritage'), 1500);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete site');
    }
  };

  const downloadQR = () => {
    if (!site.qr_code?.qr_value) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${site.qr_code.qr_value}`;
    link.download = `${site.name.replace(/\s+/g, '_')}_QR.png`;
    link.click();
  };

  const handleGenerateQR = async () => {
    setGeneratingQR(true);
    try {
      await heritageAPI.generateQR(id);
      showSuccess('QR code generated successfully');
      fetchSite();
    } catch (err) {
      showError('Failed to generate QR code');
    } finally {
      setGeneratingQR(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !site) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
          {/* Decorative Background Element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-100 rounded-full blur-3xl -z-10 opacity-60"></div>

          <div className="w-24 h-24 rounded-full bg-[#1A2F23] flex items-center justify-center mb-8 shadow-xl shadow-zinc-200">
            <svg className="w-10 h-10 text-[#E6E4DD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1A2F23] mb-4">Site Unavailable</h2>
          <p className="text-zinc-500 text-lg mb-10 max-w-lg leading-relaxed">
            {error || 'The heritage site you are looking for is currently inaccessible or has been removed from our collection.'}
          </p>

          <button
            onClick={() => navigate('/heritage')}
            className="px-8 py-4 bg-[#1A2F23] text-white text-sm font-bold uppercase tracking-widest rounded-full hover:bg-[#BC5A45] hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Discover Other Sites
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const photos = site.photos || [];
  const rules = site.safety_rules || [];
  const coords = site.location_map ? site.location_map.split(',').map(Number) : [];
  const hasValidMap = coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]);

  return (
    <DashboardLayout>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null })}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        confirmStyle={confirmModal.confirmStyle}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        heritageId={site.id}
        title={site.name}
        user={role ? user : null}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/heritage')}
            className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium"
          >
            <span className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </span>
            Back to Heritage Sites
          </button>

          {role?.toLowerCase() === 'guide' && !site.is_deleted && (
            <button
              onClick={() => navigate(`/heritage/${id}/edit`)}
              className="flex items-center gap-2 px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800 hover:shadow-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Details
            </button>
          )}
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-zinc-900 mb-4 tracking-tight leading-[1.1]">
                {site.name}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-zinc-600">
                {site.location_map && (
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-800">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {hasValidMap ? 'Interactive Map Available' : 'Location Info'}
                  </div>
                )}
                {site.short_description && (
                  <p className="text-lg text-zinc-500 border-l-2 border-zinc-200 pl-4 font-medium">
                    {site.short_description}
                  </p>
                )}
              </div>
            </div>

            {/* BOOK NOW BUTTON */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="shrink-0 px-6 py-3 bg-[#1A2F23] text-[#E6E4DD] rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#2C4A3A] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <span>Book Visit</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hero Gallery */}
        <div className="mb-12 space-y-4">
          <div className="relative aspect-21/9 w-full overflow-hidden rounded-[2.5rem] bg-zinc-100 shadow-sm border border-zinc-100">
            {photos.length > 0 ? (
              <img
                src={photos[selectedPhoto].image_url}
                alt={site.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
                <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium uppercase tracking-wider">No Images Available</span>
              </div>
            )}

            {/* Gallery Dots/Nav */}
            {photos.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/20 backdrop-blur-md rounded-full">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhoto(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${selectedPhoto === idx ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-7 xl:col-span-8">

            <div className="space-y-12">
              <p className="text-xl md:text-2xl leading-relaxed text-zinc-800 font-light">
                {site.description}
              </p>

              {site.historical_overview && (
                <div>
                  <SectionHeading>
                    <span className="w-8 h-1 bg-zinc-900 rounded-full inline-block"></span>
                    Historical Overview
                  </SectionHeading>
                  <p className="text-lg text-zinc-700 leading-8">{site.historical_overview}</p>
                </div>
              )}

              {site.cultural_significance && (
                <div>
                  <SectionHeading>
                    <span className="w-8 h-1 bg-zinc-900 rounded-full inline-block"></span>
                    Cultural Significance
                  </SectionHeading>
                  <p className="text-lg text-zinc-700 leading-8">{site.cultural_significance}</p>
                </div>
              )}
            </div>

            {/* Events Section */}
            <div className="mb-16">
              <HeritageEvents
                heritageId={site.id}
                canManage={role === 'guide' || role === 'admin'}
                onManage={() => navigate(`/heritage/${site.id}/events`)}
              />
            </div>

            {/* Rules Section */}
            {rules.length > 0 && (
              <div className="mt-16">
                <SectionHeading>
                  <span className="w-8 h-1 bg-zinc-900 rounded-full inline-block"></span>
                  Visitor Guidelines
                </SectionHeading>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mt-8">
                  {rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-4 group">
                      <div className="shrink-0 w-6 h-6 rounded-full border border-zinc-200 flex items-center justify-center mt-0.5 group-hover:border-zinc-900 group-hover:bg-zinc-900 transition-all duration-300">
                        <svg className="w-3 h-3 text-zinc-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-zinc-600 text-base leading-relaxed group-hover:text-zinc-900 transition-colors">
                        {rule.rule_text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Reviews Section */}
            <div className="mt-16">
              <SectionHeading>
                <span className="w-8 h-1 bg-zinc-900 rounded-full inline-block"></span>
                Visitor Reviews
              </SectionHeading>
              <FeedbackList feedbacks={feedbacks} />
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8 h-fit lg:sticky lg:top-8">
            {/* Map Widget */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Location
                </h3>
              </div>

              {hasValidMap ? (
                <>
                  <div className="h-80 sm:h-96 w-full z-0 relative">
                    <MapContainer
                      key={`${coords[0]}-${coords[1]}`}
                      center={[coords[0], coords[1]]}
                      zoom={14}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <Marker position={[coords[0], coords[1]]}>
                        <Tooltip permanent>{site.name}</Tooltip>
                      </Marker>
                    </MapContainer>
                  </div>
                  <div className="p-4 bg-white border-t border-zinc-100">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10 active:scale-[0.98]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Get Directions
                    </a>
                  </div>
                </>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center bg-zinc-50 p-6 text-center">
                  <svg className="w-10 h-10 text-zinc-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-zinc-400">Map data unavailable for this location.</p>
                </div>
              )}
            </div>

            {/* QR Code Widget */}
            <div className="bg-zinc-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
              {/* Decorative Circle */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-zinc-800 rounded-full blur-2xl group-hover:bg-zinc-700 transition-colors" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="font-bold text-white text-lg">Digital Pass</h3>
                {(role === 'admin' || role === 'guide') && site.qr_code?.qr_value && (
                  <button onClick={downloadQR} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors" title="Download QR">
                    <svg className="w-5 h-5 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                )}
              </div>

              {site.qr_code?.qr_value ? (
                <div className="bg-white p-4 rounded-xl mb-4 relative z-10 shadow-lg">
                  <img
                    src={`data:image/png;base64,${site.qr_code.qr_value}`}
                    alt="QR Code"
                    className="w-full aspect-square object-contain"
                  />
                  <p className="text-center text-zinc-900 text-xs font-bold mt-3 uppercase tracking-widest">Scan to View</p>
                </div>
              ) : (
                <div className="bg-white/10 rounded-xl aspect-square flex items-center justify-center mb-6 border-2 border-dashed border-white/20 relative z-10">
                  <p className="text-zinc-400 text-sm font-medium">No QR Generated</p>
                </div>
              )}

              {role === 'guide' && !site.qr_code?.qr_value && (
                <button
                  onClick={handleGenerateQR}
                  disabled={generatingQR}
                  className="w-full py-3 bg-white text-zinc-900 font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 relative z-10"
                >
                  {generatingQR ? 'Generating...' : 'Generate QR Code'}
                </button>
              )}
            </div>

            {/* Admin Status Card */}
            {role === 'admin' && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 pb-2">Admin Control</h3>

                <div className="flex items-center justify-between mb-6">
                  <span className="text-zinc-900 font-medium">Current Status</span>
                  <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full ${site.is_deleted ? 'bg-red-100 text-red-700' :
                    site.is_active ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                    {site.is_deleted ? 'Deleted' : site.is_active ? 'Active' : 'Pending'}
                  </span>
                </div>

                <div className="space-y-3">
                  {!site.is_deleted && (
                    <>
                      {!site.is_active ? (
                        <button
                          onClick={handleApprove}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20"
                        >
                          Approve Site
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmModal({
                            isOpen: true,
                            action: handleDisable,
                            title: 'Disable Site',
                            description: 'This will hide the site from public view temporarily.',
                            confirmText: 'Disable',
                            confirmStyle: 'warning'
                          })}
                          className="w-full py-2.5 rounded-xl bg-white border-2 border-amber-200 text-amber-700 font-bold hover:bg-amber-50 transition-colors"
                        >
                          Suspend Site
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmModal({
                          isOpen: true,
                          action: handleDelete,
                          title: 'Delete Site',
                          description: 'This is a destructive action. The site will be moved to trash.',
                          confirmText: 'Delete',
                          confirmStyle: 'danger'
                        })}
                        className="w-full py-2.5 rounded-xl bg-white border-2 border-red-200 text-red-700 font-bold hover:bg-red-50 transition-colors"
                      >
                        Delete Site
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout >
  );
};

export default HeritageDetail;
