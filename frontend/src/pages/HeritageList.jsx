import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { heritageAPI } from '../services/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useToast } from '../components/ui/ToastProvider';

const HeritageList = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [generatingQR, setGeneratingQR] = useState(null);
  const role = localStorage.getItem('user_role')?.toLowerCase();

  useEffect(() => {
    fetchHeritage();
  }, []);

  const fetchHeritage = async () => {
    try {
      const response = await heritageAPI.getAll();
      setSites(response.data);
    } catch (err) {
      showError('Failed to load heritage sites');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (e, siteId) => {
    e.stopPropagation();
    setGeneratingQR(siteId);
    try {
      await heritageAPI.generateQR(siteId);
      showSuccess('QR code generated successfully');
      fetchHeritage();
    } catch (err) {
      showError('Failed to generate QR code');
    } finally {
      setGeneratingQR(null);
    }
  };

  const filteredSites = role === 'admin'
    ? filter === 'active'
      ? sites.filter(s => s.is_active && !s.is_deleted)
      : filter === 'inactive'
        ? sites.filter(s => !s.is_active && !s.is_deleted)
        : filter === 'deleted'
          ? sites.filter(s => s.is_deleted)
          : sites
    : sites;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-3 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
            <p className="text-zinc-500 font-medium animate-pulse">Discovering heritage...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#1A2F23] tracking-tight leading-[1.1]">
              Architectural <br className="hidden sm:block" />
              <span className="text-zinc-400 italic">Chronicles</span>
            </h1>
            <p className="text-lg text-zinc-600 leading-relaxed max-w-xl">
              Explore the curated collection of Kerala's most significant heritage sites, preserving history one stone at a time.
            </p>
          </div>

          {role === 'guide' && (
            <button
              onClick={() => navigate('/heritage/create')}
              className="group flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full font-medium hover:bg-zinc-800 hover:shadow-lg transition-all active:scale-95"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Site
            </button>
          )}
        </div>

        {/* Admin Filters */}
        {role === 'admin' && (
          <div className="flex flex-wrap gap-2 mb-10 pb-4 border-b border-zinc-100">
            {['active', 'inactive', 'deleted', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${filter === f
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-200'
                  }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {filteredSites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center rounded-3xl bg-zinc-50 border border-zinc-100 border-dashed">
            <div className="w-16 h-16 mb-4 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">No Records Found</h3>
            <p className="text-zinc-500 max-w-sm">
              {role === 'admin' && filter !== 'all'
                ? `There are no ${filter} heritage sites to display at the moment.`
                : 'Start by adding a new heritage site to the collection.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {filteredSites.map((site) => (
              <article
                key={site.id}
                onClick={() => navigate(`/heritage/${site.id}`)}
                className="group flex flex-col h-[500px] bg-white rounded-4xl overflow-hidden border border-zinc-200/60 shadow-sm hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 cursor-pointer"
              >
                {/* --- IMAGE SECTION (55%) --- */}
                <div className="relative h-[55%] w-full overflow-hidden">
                  {site.photos && site.photos.length > 0 ? (
                    <img
                      src={site.photos[0].image_url}
                      alt={site.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Status Badges - Floating Top Left */}
                  {(role === 'admin' || role === 'guide') && (
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {site.is_deleted ? (
                        <span className="px-3 py-1 bg-red-100/90 backdrop-blur-md text-red-800 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm border border-red-200/50">
                          Deleted
                        </span>
                      ) : !site.is_active ? (
                        <span className="px-3 py-1 bg-amber-100/90 backdrop-blur-md text-amber-800 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm border border-amber-200/50">
                          Pending
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-100/90 backdrop-blur-md text-emerald-800 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm border border-emerald-200/50">
                          Active
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* --- CONTENT SECTION (45%) --- */}
                <div className="flex flex-col grow p-8 relative">
                  {/* Decorative Line */}
                  <div className="w-12 h-1 bg-[#1A2F23] rounded-full mb-5 opacity-80 group-hover:w-20 transition-all duration-500"></div>

                  <div className="grow">
                    <h2 className="text-2xl font-serif font-bold text-[#1A2F23] mb-3 leading-tight group-hover:text-emerald-800 transition-colors line-clamp-2">
                      {site.name}
                    </h2>

                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3">
                      {site.short_description || site.description}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-5 border-t border-zinc-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                      {site.location_map && (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <span>Location</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {role === 'guide' && !site.qr_code && (
                        <button
                          onClick={(e) => handleGenerateQR(e, site.id)}
                          disabled={generatingQR === site.id}
                          className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors text-zinc-600"
                          title="Generate QR"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 14.5V12m0 0V8.882a9.018 9.018 0 016-1.62m-6 1.62A9.018 9.018 0 006 9.882V12m0 0A9.018 9.018 0 0012 14.5m0 0V17m0 0a9.018 9.018 0 006-1.62m-6 1.62A9.018 9.018 0 016 15.382" /></svg>
                        </button>
                      )}
                      <span className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-[#1A2F23] group-hover:text-white group-hover:border-[#1A2F23] transition-all duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HeritageList;
