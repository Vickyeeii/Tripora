import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import NotificationDropdown from '../common/NotificationDropdown';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem('user_role');
  const isAuthenticated = !!localStorage.getItem('access_token');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
                className="flex items-center gap-2 group"
              >
                <span className="text-2xl font-serif font-bold tracking-tight text-zinc-900">Tripora.</span>
              </button>
              <div className="hidden md:flex items-center gap-1">
                {isAuthenticated && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    Dashboard
                  </button>
                )}
                <button
                  onClick={() => navigate('/heritage')}
                  className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Heritage
                </button>
                <button
                  onClick={() => navigate('/events')}
                  className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Events
                </button>
                <button
                  onClick={() => navigate('/track-booking')}
                  className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Track Visit
                </button>
                {isAuthenticated && role !== 'admin' && (
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    Profile
                  </button>
                )}
                {isAuthenticated && role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin/guides')}
                    className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    Pending Guides
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <NotificationDropdown role={role} />
                  <button
                    onClick={authAPI.logout}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-colors shadow-lg shadow-zinc-900/10"
                  >
                    Sign Up
                  </button>
                </div>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-zinc-200">
              <div className="space-y-1">
                {isAuthenticated && (
                  <button
                    onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    Dashboard
                  </button>
                )}
                <button
                  onClick={() => { navigate('/heritage'); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Heritage
                </button>
                <button
                  onClick={() => { navigate('/events'); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Events
                </button>
                <button
                  onClick={() => { navigate('/track-booking'); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Track Visit
                </button>

                {isAuthenticated ? (
                  <>
                    {role !== 'admin' && (
                      <button
                        onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                        className="block w-full text-left px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                      >
                        Profile
                      </button>
                    )}
                    {role === 'admin' && (
                      <button
                        onClick={() => { navigate('/admin/guides'); setMobileMenuOpen(false); }}
                        className="block w-full text-left px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                      >
                        Pending Guides
                      </button>
                    )}
                    <button
                      onClick={authAPI.logout}
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </div>
    </div >
  );
};

export default DashboardLayout;
