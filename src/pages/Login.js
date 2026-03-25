import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => { setForm(f => ({...f, [k]: v})); setErrors(e => ({...e, [k]: ''})); };

  // Quick fill for demo
  const fillDemo = (type) => {
    if (type === 'admin') setForm({ email: 'admin@hotel.com', password: 'admin123' });
    else setForm({ email: 'user@hotel.com', password: 'user123' });
    setErrors({});
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12 bg-hotel-dark">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-serif font-bold">L</span>
            </div>
            <span className="font-serif text-2xl text-white">LuxeStay</span>
          </Link>

          <h1 className="font-serif text-3xl text-white mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account to continue</p>

          {/* Demo credentials */}
          <div className="mb-6 p-4 bg-primary-900/15 border border-primary-800/30 rounded-xl">
            <p className="text-xs text-primary-400 font-medium mb-2">🔑 Demo Credentials</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => fillDemo('user')} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors">
                👤 User Login
              </button>
              <button onClick={() => fillDemo('admin')} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors">
                🛠️ Admin Login
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Email Address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@example.com" className={`input-field ${errors.email ? 'border-red-500/50' : ''}`} autoComplete="email" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Password</label>
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

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Create one free →</Link>
          </p>
        </div>
      </div>

      {/* Right: Image panel */}
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
