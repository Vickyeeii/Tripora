import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InlineError from '../components/ui/InlineError';
import InlineSuccess from '../components/ui/InlineSuccess';
import img1 from '.././assets/land2.jpeg'
import { authAPI } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('tourist');
  const [phoneCode, setPhoneCode] = useState('+91');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    country: 'India',
    preferred_language: 'English',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+971', country: 'UAE' },
    { code: '+65', country: 'Singapore' },
    { code: '+60', country: 'Malaysia' },
  ];

  const countries = ['India', 'USA', 'UK', 'UAE', 'Singapore', 'Malaysia', 'Australia', 'Canada', 'Germany', 'France'];
  const languages = ['English', 'Hindi', 'Malayalam', 'Tamil', 'Telugu', 'Kannada', 'Spanish', 'French', 'German', 'Chinese'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        phone: phoneCode + formData.phone,
      };

      if (userType === 'guide') {
        await authAPI.registerGuide(submitData);
        setError('');
        setSuccess('Application submitted for review.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        await authAPI.register(submitData);
        const loginResponse = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('access_token', loginResponse.data.access_token);
        localStorage.setItem('refresh_token', loginResponse.data.refresh_token);
        localStorage.setItem('user_role', loginResponse.data.role);
        setSuccess('Account created.');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.detail || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A2F23] flex items-center justify-center p-4 selection:bg-zinc-300 selection:text-[#1A2F23]">
      <div className="w-full max-w-7xl bg-[#E6E4DD] rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[800px]">

        {/* LEFT: VISUAL */}
        <div className="h-64 md:h-auto md:w-5/12 relative bg-[#15251c] flex items-center justify-center overflow-hidden shrink-0">
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-zinc-900/40 mix-blend-multiply z-10" />
            <img
              src={img1}
              className="w-full h-full object-cover opacity-80"
              alt="Kerala Backwaters"
            />
          </div>

          <div className="relative z-20 text-center px-6 md:px-12">
            <h2 className="font-serif text-3xl md:text-6xl text-[#E6E4DD] mb-2 md:mb-6 leading-tight">
              Begin Your<br />Story.
            </h2>
            <p className="text-[#E6E4DD]/70 text-sm md:text-lg font-light max-w-sm mx-auto">
              Whether you're exploring the roots or guiding the way.
            </p>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="md:w-7/12 p-6 md:p-16 flex flex-col justify-center bg-[#E6E4DD] overflow-y-auto">
          <div className="max-w-xl mx-auto w-full">
            <div className="flex justify-between items-start mb-10">
              <div>
                <Link to="/" className="text-[#1A2F23] font-serif font-bold text-2xl tracking-tight block hover:opacity-70 transition-opacity mb-2">
                  Tripora.
                </Link>
                <h3 className="font-serif text-3xl text-[#1A2F23]">Create Account</h3>
              </div>

              {/* Custom Toggle */}
              <div className="bg-[#1A2F23]/5 p-1 rounded-full flex gap-1">
                <button
                  onClick={() => setUserType('tourist')}
                  className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${userType === 'tourist' ? 'bg-[#1A2F23] text-[#E6E4DD] shadow-md' : 'text-[#1A2F23]/50 hover:text-[#1A2F23]'}`}
                >
                  Tourist
                </button>
                <button
                  onClick={() => setUserType('guide')}
                  className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${userType === 'guide' ? 'bg-zinc-700 text-white shadow-md' : 'text-[#1A2F23]/50 hover:text-[#1A2F23]'}`}
                >
                  Guide
                </button>
              </div>
            </div>

            <InlineError message={error} />
            <InlineSuccess message={success} />
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A2F23]/50 mb-2 ml-2">Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="e.g. John Doe" required className="w-full bg-white border border-[#1A2F23]/10 px-6 py-4 rounded-xl text-[#1A2F23] placeholder:text-[#1A2F23]/30 focus:border-[#1A2F23] focus:ring-1 focus:ring-[#1A2F23] transition-all outline-none font-medium shadow-sm" />
              </div>

              {/* Contact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A2F23]/50 mb-2 ml-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" required className="w-full bg-white border border-[#1A2F23]/10 px-6 py-4 rounded-xl text-[#1A2F23] placeholder:text-[#1A2F23]/30 focus:border-[#1A2F23] focus:ring-1 focus:ring-[#1A2F23] transition-all outline-none font-medium shadow-sm" />
                </div>
                {/* Unified Phone Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A2F23]/50 mb-2 ml-2">Mobile Number</label>
                  <div className="flex items-center w-full bg-white border border-[#1A2F23]/10 rounded-xl overflow-hidden shadow-sm focus-within:border-[#1A2F23] focus-within:ring-1 focus-within:ring-[#1A2F23] transition-all">
                    <div className="relative w-28 border-r border-[#1A2F23]/10 h-full">
                      <select
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        className="w-full h-full appearance-none bg-transparent pl-6 pr-8 py-4 text-[#1A2F23] font-bold outline-none cursor-pointer"
                      >
                        {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#1A2F23]/40 text-xs">▼</div>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      required
                      className="flex-1 bg-transparent border-none px-6 py-4 text-[#1A2F23] placeholder:text-[#1A2F23]/30 focus:outline-none font-medium h-full"
                    />
                  </div>
                </div>
              </div>

              {/* Tourist Fields */}
              {userType === 'tourist' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A2F23]/50 mb-2 ml-2">Nationality</label>
                    <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-white border border-[#1A2F23]/10 px-6 py-4 rounded-xl text-[#1A2F23] outline-none font-medium cursor-pointer appearance-none focus:border-[#1A2F23] focus:ring-1 focus:ring-[#1A2F23] shadow-sm">
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="absolute right-6 top-[52px] -translate-y-1/2 pointer-events-none text-[#1A2F23]/40">▼</div>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A2F23]/50 mb-2 ml-2">Preferred Language</label>
                    <select name="preferred_language" value={formData.preferred_language} onChange={handleChange} className="w-full bg-white border border-[#1A2F23]/10 px-6 py-4 rounded-xl text-[#1A2F23] outline-none font-medium cursor-pointer appearance-none focus:border-[#1A2F23] focus:ring-1 focus:ring-[#1A2F23] shadow-sm">
                      {languages.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <div className="absolute right-6 top-[52px] -translate-y-1/2 pointer-events-none text-[#1A2F23]/40">▼</div>
                  </div>
                </div>
              )}

              {/* Guide Fields */}
              {userType === 'guide' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A2F23]/50 mb-2 ml-2">Residential Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Full address" required className="w-full bg-white border border-[#1A2F23]/10 px-6 py-4 rounded-xl text-[#1A2F23] placeholder:text-[#1A2F23]/30 focus:border-[#1A2F23] focus:ring-1 focus:ring-[#1A2F23] transition-all outline-none font-medium shadow-sm" />
                </div>
              )}

              {/* Password */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A2F23]/50 mb-2 ml-2">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create Password"
                  required
                  className="w-full bg-white border border-[#1A2F23]/10 px-6 py-4 rounded-xl text-[#1A2F23] placeholder:text-[#1A2F23]/30 focus:border-[#1A2F23] focus:ring-1 focus:ring-[#1A2F23] transition-all outline-none font-medium shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-[52px] -translate-y-1/2 text-[#1A2F23]/40 hover:text-zinc-600 transition-colors text-[10px] uppercase font-bold tracking-widest"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-xl font-bold uppercase tracking-widest text-[#E6E4DD] transition-all hover:shadow-lg hover:-translate-y-0.5 ${userType === 'guide' ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-[#1A2F23] hover:bg-[#2C4A3A]'}`}
              >
                {loading ? 'Processing...' : (userType === 'guide' ? 'Submit Application' : 'Create Account')}
              </button>

              <div className="text-center pt-2">
                <p className="text-[#1A2F23]/60 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#1A2F23] font-bold border-b border-[#1A2F23]/20 hover:border-[#1A2F23] transition-all pb-0.5">
                    Sign In
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

export default Register;
