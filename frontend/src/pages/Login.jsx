import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InlineError from '../components/ui/InlineError';
import InlineSuccess from '../components/ui/InlineSuccess';
import { authAPI } from '../services/api';
import img1 from '.././assets/land1.jpeg'

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user_role', response.data.role);

      setSuccess('Welcome back.');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.detail;
      const errorText = errorMsg?.includes('not approved') || errorMsg?.includes('approval')
        ? 'Account pending approval.'
        : errorMsg || 'Unable to sign in.';

      setError(errorText);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A2F23] flex items-center justify-center p-4 selection:bg-zinc-300 selection:text-[#1A2F23]">
      <div className="w-full max-w-6xl bg-[#E6E4DD] rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[700px]">

        {/* LEFT: VISUAL */}
        <div className="h-64 md:h-auto md:w-1/2 relative bg-[#15251c] flex items-center justify-center overflow-hidden shrink-0">
          {/* Arch Mask */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-[#1A2F23]/40 z-10" />
            <img
              src={img1}
              className="w-full h-full object-cover opacity-80"
              alt="Kerala Heritage"
            />
          </div>

          <div className="relative z-20 text-center px-6 md:px-12">
            <h2 className="font-serif text-3xl md:text-6xl text-[#E6E4DD] mb-2 md:mb-6 leading-tight">
              The Journey<br />Continues.
            </h2>
            <p className="text-[#E6E4DD]/70 text-sm md:text-lg font-light max-w-sm mx-auto">
              Step back into the timeless stories of God's Own Country.
            </p>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="md:w-1/2 p-8 md:p-20 flex flex-col justify-center bg-[#E6E4DD]">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-12">
              <Link to="/" className="text-[#1A2F23] font-serif font-bold text-2xl tracking-tight mb-8 block hover:opacity-70 transition-opacity">
                Tripora.
              </Link>
              <h3 className="font-serif text-4xl text-[#1A2F23] mb-2">Welcome Back</h3>
              <p className="text-[#1A2F23]/60">Functionality meets heritage.</p>
            </div>

            <InlineError message={error} />
            <InlineSuccess message={success} />
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A2F23]/50 mb-2 ml-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-white border border-[#1A2F23]/10 px-6 py-4 rounded-xl text-[#1A2F23] placeholder:text-[#1A2F23]/30 focus:border-[#1A2F23] focus:ring-1 focus:ring-[#1A2F23] transition-all outline-none font-medium shadow-sm"
                  />
                </div>
                <div className="relative group">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A2F23]/50 mb-2 ml-2">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-white border border-[#1A2F23]/10 px-6 py-4 rounded-xl text-[#1A2F23] placeholder:text-[#1A2F23]/30 focus:border-[#1A2F23] focus:ring-1 focus:ring-[#1A2F23] transition-all outline-none font-medium shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-[52px] -translate-y-1/2 text-[#1A2F23]/40 hover:text-[#1A2F23] transition-colors text-[10px] uppercase font-bold tracking-widest"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A2F23] text-[#E6E4DD] py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-[#2C4A3A] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Sign In'}
              </button>

              <div className="text-center pt-2">
                <p className="text-[#1A2F23]/60 text-sm">
                  New here?{' '}
                  <Link to="/register" className="text-[#1A2F23] font-bold border-b border-[#1A2F23]/20 hover:border-[#1A2F23] transition-all pb-0.5">
                    Start your journey
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
