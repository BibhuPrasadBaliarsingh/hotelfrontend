import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Spinner from '../../components/Spinner';
import { getAllUsers, deleteUser } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAllUsers()
      .then(res => setUsers(res.data.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q);
  }), [users, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user and all their data?')) return;
    setDeleting(id);
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally { setDeleting(null); }
  };

  const avatarBg = (name) => {
    const colors = ['from-primary-600 to-primary-800', 'from-blue-600 to-blue-800', 'from-purple-600 to-purple-800', 'from-green-600 to-green-800'];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  return (
    <AdminLayout title="User Management" subtitle={`${users.length} registered guests`}>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          ['👥', 'Total Users', users.length],
          ['📅', 'Joined This Month', users.filter(u => {
            const d = new Date(u.createdAt);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length],
          ['📞', 'With Phone Number', users.filter(u => u.phone).length],
        ].map(([icon, label, val]) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className="text-2xl">{icon}</div>
            <div>
              <div className="text-2xl font-bold text-white">{val}</div>
              <div className="text-gray-500 text-xs">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search users by name, email, or phone..."
          className="input-field text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hotel-border">
                  {['User', 'Contact', 'Joined', 'Role', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs text-gray-500 uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hotel-border">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarBg(u.name)} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{u.name}</p>
                          <p className="text-gray-600 text-xs font-mono">{u._id?.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-300 text-sm">{u.email}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{u.phone || '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">
                        Guest
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(u)}
                          className="text-xs px-3 py-1.5 border border-white/10 text-gray-400 rounded-lg hover:border-primary-500/50 hover:text-primary-400 transition-all">
                          View
                        </button>
                        <button onClick={() => handleDelete(u._id)} disabled={deleting === u._id}
                          className="text-xs px-3 py-1.5 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/5 transition-all disabled:opacity-50">
                          {deleting === u._id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-14 text-gray-500 text-sm">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selected && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="bg-hotel-card border border-hotel-border rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-hotel-border flex justify-between items-center">
              <h3 className="text-white font-semibold">User Profile</h3>
              <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10">✕</button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarBg(selected.name)} flex items-center justify-center text-white font-bold text-2xl`}>
                  {selected.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">{selected.name}</h4>
                  <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">Guest Account</span>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ['Email', selected.email],
                  ['Phone', selected.phone || 'Not provided'],
                  ['User ID', selected._id?.slice(-12)],
                  ['Member Since', new Date(selected.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-white/5 pb-2 last:border-0">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-white text-right max-w-[180px] break-all">{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { handleDelete(selected._id); setSelected(null); }}
                className="w-full mt-5 py-2.5 border border-red-500/30 text-red-400 text-sm rounded-xl hover:bg-red-500/5 transition-colors">
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
