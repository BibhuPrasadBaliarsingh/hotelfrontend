import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import toast from 'react-hot-toast';

export function Profile() {
  const { user, dispatch } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await updateProfile(form);
      dispatch({ type: 'SET_USER', payload: res.data.user });
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="bg-hotel-card border-b border-hotel-border px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl text-white">My Profile</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your account information</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center text-white font-bold text-2xl font-serif">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-white font-semibold text-xl">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className={`badge text-xs mt-1 ${user?.role === 'admin' ? 'bg-primary-900/30 text-primary-400 border border-primary-800/30' : 'bg-blue-900/20 text-blue-400 border border-blue-800/20'}`}>
                {user?.role === 'admin' ? '🛠️ Administrator' : '👤 Guest'}
              </span>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Full Name</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="input-field" placeholder="+1 234 567 8900" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditing(false)} className="btn-outline flex-1 py-2.5">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {[['Email', user?.email], ['Phone', user?.phone || 'Not provided'], ['Member Since', new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-white/5 text-sm last:border-0">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-white">{v}</span>
                </div>
              ))}
              <button onClick={() => setEditing(true)} className="btn-outline w-full mt-4 py-2.5 text-sm">Edit Profile</button>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-white font-semibold mb-4">Account Security</h3>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <div>
              <p className="text-white text-sm">Password</p>
              <p className="text-gray-600 text-xs">Last changed never</p>
            </div>
            <button className="btn-outline text-xs py-2 px-4" onClick={() => toast('Password change coming soon!')}>Change</button>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="text-white text-sm">Two-Factor Authentication</p>
              <p className="text-gray-600 text-xs">Extra security for your account</p>
            </div>
            <div className="text-xs px-3 py-1.5 bg-gray-700/30 text-gray-500 rounded-lg">Not set up</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
