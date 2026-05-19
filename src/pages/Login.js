import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [mode, setMode] = useState('refer');
  const [form, setForm] = useState({
    email: '', password: '', referId: '', checkInDate: '', checkInTime: '', name: '', phone: '', aadhaarNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, guestLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const validateGuest = () => {
    const errs = {};
    if (!form.referId.trim()) errs.referId = 'Refer ID is required';
    if (!form.checkInDate) errs.checkInDate = 'Check-in date is required';
    if (!form.checkInTime) errs.checkInTime = 'Check-in time is required';
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    return errs;
  };

  const validateStaff = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStaff();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'reception') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'management') navigate('/admin/dashboard', { replace: true });
      else navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    const errs = validateGuest();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await guestLogin({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        referId: form.referId.trim(),
        checkInDate: form.checkInDate,
        checkInTime: form.checkInTime,
        aadhaarNumber: form.aadhaarNumber.trim(),
      });
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/guest/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Guest login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const fillDemo = (type) => {
    if (type === 'admin') setForm({ ...form, email: 'admin@hotel.com', password: 'admin123' });
    if (type === 'management') setForm({ ...form, email: 'manager@hotel.com', password: 'manage123' });
    if (type === 'reception') setForm({ ...form, email: 'reception@hotel.com', password: 'recept123' });
    if (type === 'user') setForm({ ...form, email: 'user@hotel.com', password: 'user123' });
    setErrors({});
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12 bg-hotel-dark">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col gap-4 mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-serif font-bold">L</span>
              </div>
              <span className="font-serif text-2xl text-white">LuxeStay</span>
            </Link>
            <div className="bg-primary-900/20 border border-primary-800/30 rounded-3xl p-5">
              <h1 className="font-serif text-3xl text-white mb-2">Choose your access</h1>
              <p className="text-gray-400 text-sm">Sign in as a guest, reception staff, management, or admin. Guest access works with Refer ID and check-in time.</p>
              <div className="mt-4 flex gap-2 flex-wrap">
                {[
                  ['refer', 'Guest Access'],
                  ['credentials', 'Staff / Admin']
                ].map(([key, label]) => (
                  <button key={key} onClick={() => setMode(key)}
                    className={`py-2 px-4 rounded-2xl text-sm font-medium transition ${mode === key ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6 bg-hotel-card border border-hotel-border">
            {mode === 'refer' ? (
              <>
                <h2 className="text-xl text-white font-semibold mb-3">Guest login with Refer ID</h2>
                <p className="text-gray-500 text-sm mb-6">Enter your booking reference details and get quick access to your stay session.</p>
                <form onSubmit={handleGuestSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1 block">Refer ID *</label>
                    <input type="text" value={form.referId} onChange={e => set('referId', e.target.value)} placeholder="Enter your refer ID" className={`input-field ${errors.referId ? 'border-red-500/50' : ''}`} />
                    {errors.referId && <p className="text-red-400 text-xs mt-1">{errors.referId}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">Check-in Date *</label>
                      <input type="date" value={form.checkInDate} onChange={e => set('checkInDate', e.target.value)} className={`input-field ${errors.checkInDate ? 'border-red-500/50' : ''}`} />
                      {errors.checkInDate && <p className="text-red-400 text-xs mt-1">{errors.checkInDate}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">Check-in Time *</label>
                      <input type="time" value={form.checkInTime} onChange={e => set('checkInTime', e.target.value)} className={`input-field ${errors.checkInTime ? 'border-red-500/50' : ''}`} />
                      {errors.checkInTime && <p className="text-red-400 text-xs mt-1">{errors.checkInTime}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">Name *</label>
                      <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" className={`input-field ${errors.name ? 'border-red-500/50' : ''}`} />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">Phone *</label>
                      <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone number" className={`input-field ${errors.phone ? 'border-red-500/50' : ''}`} />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1 block">Email <span className="text-gray-500">(optional)</span></label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Optional email" className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1 block">Aadhaar / ID number <span className="text-gray-500">(optional)</span></label>
                    <input type="text" value={form.aadhaarNumber} onChange={e => set('aadhaarNumber', e.target.value)} placeholder="Aadhaar or PAN" className="input-field" />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Starting guest session…' : 'Enter Guest Booking Portal'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-xl text-white font-semibold mb-3">Staff & management login</h2>
                <p className="text-gray-500 text-sm mb-6">Reception, management and admin users should sign in with their credentials.</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {['user', 'reception', 'management', 'admin'].map((role) => (
                    <button key={role} onClick={() => fillDemo(role)} type="button"
                      className="text-xs py-2 px-3 rounded-2xl border border-white/10 text-gray-300 hover:border-primary-500 hover:text-white transition-colors">
                      {role === 'admin' ? 'Admin' : role.charAt(0).toUpperCase() + role.slice(1)} Demo
                    </button>
                  ))}
                </div>
                <form onSubmit={handleStaffSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1 block">Email Address</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="staff@example.com" className={`input-field ${errors.email ? 'border-red-500/50' : ''}`} autoComplete="email" />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1 block">Password</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                        placeholder="••••••••" className={`input-field pr-10 ${errors.password ? 'border-red-500/50' : ''}`} autoComplete="current-password" />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Signing in…' : 'Sign In to Dashboard'}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Need a new account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Create one free →</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80" alt="Hotel" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-hotel-dark/60" />
        <div className="absolute bottom-12 left-12 right-12">
          <div className="glass border border-white/10 rounded-2xl p-6">
            <div className="flex text-primary-400 text-xl mb-2">★★★★★</div>
            <p className="text-white text-sm italic leading-relaxed mb-4">"An extraordinary experience from check-in to check-out. LuxeStay truly understands what luxury means."</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-800 flex items-center justify-center text-white font-bold text-sm">S</div>
              <div>
                <p className="text-white text-sm font-semibold">Sofia Rossi</p>
                <p className="text-gray-400 text-xs">Milan, Italy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
