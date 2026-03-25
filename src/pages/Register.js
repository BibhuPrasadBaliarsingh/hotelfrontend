import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email, password: form.password, phone: form.phone });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (k, v) => { setForm(f => ({...f, [k]: v})); setErrors(e => ({...e, [k]: ''})); };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="min-h-screen flex">
      {/* Left: Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80" alt="Hotel" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-hotel-dark/60" />
        <div className="absolute top-1/2 -translate-y-1/2 left-12 right-12 space-y-4">
          {[['🏨', 'Exclusive Rooms', 'Handcrafted luxury for every guest'], ['💳', 'Easy Booking', 'Book in seconds, confirm instantly'], ['🌟', 'VIP Benefits', 'Special perks for returning guests']].map(([icon, title, desc]) => (
            <div key={title} className="glass border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <div className="text-2xl">{icon}</div>
              <div>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-gray-400 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12 bg-hotel-dark overflow-y-auto">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-serif font-bold">L</span>
            </div>
            <span className="font-serif text-2xl text-white">LuxeStay</span>
          </Link>

          <h1 className="font-serif text-3xl text-white mb-2">Create your account</h1>
          <p className="text-gray-500 text-sm mb-8">Join thousands of guests who trust LuxeStay</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Full Name *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="John Doe" className={`input-field ${errors.name ? 'border-red-500/50' : ''}`} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Email Address *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@example.com" className={`input-field ${errors.email ? 'border-red-500/50' : ''}`} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Phone Number <span className="text-gray-600">(optional)</span></label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+1 234 567 8900" className="input-field" />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Password *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="••••••••" className={`input-field pr-10 ${errors.password ? 'border-red-500/50' : ''}`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPass ? '🙈' : '👁️'}</button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1,2,3].map(s => <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= strength ? strengthColors[strength] : 'bg-white/10'}`} />)}
                  </div>
                  <span className="text-xs text-gray-500">{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Confirm Password *</label>
              <input type={showPass ? 'text' : 'password'} value={form.confirm} onChange={e => set('confirm', e.target.value)}
                placeholder="••••••••" className={`input-field ${errors.confirm ? 'border-red-500/50' : ''}`} />
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
            </div>

            <p className="text-xs text-gray-600">By registering, you agree to our <span className="text-primary-400 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-primary-400 cursor-pointer hover:underline">Privacy Policy</span>.</p>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Free Account →'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
