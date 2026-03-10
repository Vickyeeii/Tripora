import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Toast from '../components/ui/Toast';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const role = localStorage.getItem('user_role');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getMyProfile();
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      setToast({ message: 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        full_name: formData.full_name,
        phone: formData.phone,
      };
      if (role === 'tourist') {
        updateData.email = formData.email;
      }
      await usersAPI.updateMyProfile(updateData);
      setToast({ message: 'Profile updated successfully', type: 'success' });
      setEditing(false);
      fetchProfile();
    } catch (error) {
      setToast({ message: error.response?.data?.detail || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
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

      <div className="relative min-h-screen pb-20">
        {/* Background Decorative */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1A2F23] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#BC5A45] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1A2F23] mb-2 tracking-tight">
            Profile
          </h1>
          <p className="text-[#1A2F23]/60 text-lg mb-12 max-w-xl">
            Manage your digital passport details and personal booking preferences.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Card: Passport Visual */}
            <div className="md:col-span-5 space-y-6">
              <div className="relative aspect-[3/4] bg-[#1A2F23] rounded-3xl p-8 text-[#E6E4DD] shadow-2xl overflow-hidden flex flex-col justify-between group">
                {/* Decorative Patterns */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                <div className="absolute top-4 right-4 w-16 h-16 border-2 border-[#E6E4DD]/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#E6E4DD]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>

                {/* Avatar / Initials */}
                <div className="relative z-10 text-center space-y-4 my-auto">
                  <div className="w-32 h-32 mx-auto rounded-full bg-[#E6E4DD] border-4 border-[#E6E4DD]/20 flex items-center justify-center shadow-lg relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
                    <span className="font-serif text-5xl font-bold text-[#1A2F23]">
                      {profile?.full_name?.charAt(0).toUpperCase() || 'T'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold tracking-wide break-words line-clamp-2">{profile?.full_name || 'Traveler'}</h3>
                    <p className="text-[#E6E4DD]/60 text-sm uppercase tracking-widest mt-1">
                      {role === 'guide' ? 'Heritage Guide' : 'Kerala Explorer'}
                    </p>
                  </div>
                </div>

                {/* Footer Passport details */}
                <div className="relative z-10 pt-6 border-t border-[#E6E4DD]/20 flex justify-between items-end text-xs opacity-60 font-mono">
                  <div>
                    <p className="uppercase tracking-widest">Role</p>
                    <p className="uppercase">{role}</p>
                  </div>
                  <div className="text-right">
                    <p className="uppercase tracking-widest">Status</p>
                    <p className="uppercase">{profile?.status ? 'Verified' : 'Active'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Edit Form */}
            <div className="md:col-span-7">
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-[#1A2F23]">Details</h3>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-5 py-2 rounded-full border border-[#1A2F23]/20 text-[#1A2F23] text-sm font-bold hover:bg-[#1A2F23] hover:text-[#E6E4DD] transition-all"
                    >
                      Edit Passport
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/50 ml-1">Full Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name || ''}
                        onChange={handleChange}
                        className="w-full bg-[#E6E4DD]/30 border border-[#1A2F23]/10 rounded-xl px-4 py-3 text-[#1A2F23] font-serif focus:outline-none focus:border-[#1A2F23]/30 focus:bg-white transition-all"
                      />
                    ) : (
                      <div className="text-lg font-serif text-[#1A2F23] px-4 py-3 border border-transparent">{profile?.full_name}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/50 ml-1">Email Address</label>
                    {editing && role === 'tourist' ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="w-full bg-[#E6E4DD]/30 border border-[#1A2F23]/10 rounded-xl px-4 py-3 text-[#1A2F23] focus:outline-none focus:border-[#1A2F23]/30 focus:bg-white transition-all"
                      />
                    ) : (
                      <div className="text-lg text-[#1A2F23] px-4 py-3 border border-transparent opacity-60 flex items-center justify-between">
                        {profile?.email}
                        {editing && <span className="text-xs italic bg-amber-100 px-2 py-1 rounded text-amber-800">Locked</span>}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1A2F23]/50 ml-1">Phone Number</label>
                    {editing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className="w-full bg-[#E6E4DD]/30 border border-[#1A2F23]/10 rounded-xl px-4 py-3 text-[#1A2F23] focus:outline-none focus:border-[#1A2F23]/30 focus:bg-white transition-all"
                      />
                    ) : (
                      <div className="text-lg text-[#1A2F23] px-4 py-3 border border-transparent font-mono">{profile?.phone || '—'}</div>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-4 mt-10 pt-6 border-t border-[#1A2F23]/5">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-[#1A2F23] text-[#E6E4DD] py-3 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFormData(profile);
                      }}
                      disabled={saving}
                      className="px-6 py-3 border border-[#1A2F23]/10 rounded-xl font-bold text-[#1A2F23] hover:bg-neutral-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
