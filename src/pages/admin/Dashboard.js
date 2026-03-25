import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import AdminLayout from '../../components/AdminLayout';
import Spinner from '../../components/Spinner';
import { getDashboardStats, getAllBookings } from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#d4882a', '#22c55e', '#3b82f6', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-primary-400 font-bold">${payload[0].value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

function StatCard({ icon, label, value, sub, trend, color = 'primary' }) {
  const colors = {
    primary: 'from-primary-900/30 to-primary-900/5 border-primary-800/30 text-primary-400',
    green: 'from-green-900/30 to-green-900/5 border-green-800/30 text-green-400',
    blue: 'from-blue-900/30 to-blue-900/5 border-blue-800/30 text-blue-400',
    red: 'from-red-900/30 to-red-900/5 border-red-800/30 text-red-400',
  };
  return (
    <div className={`stat-card bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{icon}</div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="font-serif text-3xl text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getAllBookings()])
      .then(([sRes, bRes]) => {
        setStats(sRes.data);
        setRecentBookings(bRes.data.bookings.slice(0, 8));
      })
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout title="Dashboard" subtitle="Loading...">
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </AdminLayout>
  );

  const pieData = [
    { name: 'Confirmed', value: stats?.active || 0 },
    { name: 'Completed', value: (stats?.totalBookings - stats?.active - stats?.cancelled) || 0 },
    { name: 'Revenue /100', value: Math.round((stats?.revenue || 0) / 100) },
    { name: 'Cancelled', value: stats?.cancelled || 0 },
  ].filter(d => d.value > 0);

  const STATUS_STYLES = {
    confirmed: 'bg-green-500/15 text-green-400',
    pending: 'bg-yellow-500/15 text-yellow-400',
    cancelled: 'bg-red-500/15 text-red-400',
    completed: 'bg-gray-500/15 text-gray-400',
    checkedin: 'bg-blue-500/15 text-blue-400',
  };

  return (
    <AdminLayout title="Dashboard" subtitle={`Overview for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🛏️" label="Total Rooms" value={stats?.totalRooms || 0} sub="In your inventory" color="primary" />
        <StatCard icon="📋" label="Total Bookings" value={stats?.totalBookings || 0} sub={`${stats?.active || 0} active now`} color="blue" />
        <StatCard icon="👥" label="Registered Users" value={stats?.totalUsers || 0} sub="Guest accounts" color="green" />
        <StatCard icon="💰" label="Total Revenue" value={`$${(stats?.revenue || 0).toLocaleString()}`} sub="All time earnings" color="primary" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Revenue Overview</h3>
              <p className="text-gray-500 text-xs mt-0.5">Last 6 months</p>
            </div>
            <div className="text-primary-400 font-bold">${(stats?.revenue || 0).toLocaleString()}</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.monthly || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4882a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4882a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#d4882a" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#d4882a', r: 4 }} activeDot={{ r: 6, fill: '#e3a341' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Distribution Pie */}
        <div className="card p-6">
          <h3 className="text-white font-semibold mb-1">Booking Distribution</h3>
          <p className="text-gray-500 text-xs mb-4">By status</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-400">{d.name}</span>
                </div>
                <span className="text-white font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="card p-6 mb-8">
        <h3 className="text-white font-semibold mb-1">Monthly Revenue Breakdown</h3>
        <p className="text-gray-500 text-xs mb-5">Revenue per month (last 6 months)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={stats?.monthly || []} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212,136,42,0.05)' }} />
            <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]}>
              {(stats?.monthly || []).map((_, i) => (
                <Cell key={i} fill={i === (stats?.monthly?.length - 1) ? '#d4882a' : '#7a3b0e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Bookings', value: stats?.active || 0, icon: '✅', color: 'text-green-400' },
          { label: 'Cancelled', value: stats?.cancelled || 0, icon: '❌', color: 'text-red-400' },
          { label: 'Avg Revenue/Booking', value: stats?.totalBookings ? `$${Math.round(stats.revenue / stats.totalBookings)}` : '$0', icon: '📊', color: 'text-blue-400' },
          { label: 'Occupancy Rate', value: stats?.totalRooms ? `${Math.round((stats.active / stats.totalRooms) * 100)}%` : '0%', icon: '🏨', color: 'text-primary-400' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center hover:border-primary-800/30 transition-all">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`font-bold text-xl ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Bookings Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-hotel-border">
          <h3 className="text-white font-semibold">Recent Bookings</h3>
          <Link to="/admin/bookings" className="text-primary-400 text-sm hover:text-primary-300 transition-colors">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hotel-border">
                {['Reference', 'Guest', 'Room', 'Check In', 'Amount', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hotel-border">
              {recentBookings.map(b => (
                <tr key={b._id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-primary-400">{b.bookingRef}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary-900/40 flex items-center justify-center text-primary-400 text-xs font-bold flex-shrink-0">
                        {b.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white text-sm">{b.user?.name}</p>
                        <p className="text-gray-600 text-xs">{b.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-300 text-sm">{b.room?.name}</td>
                  <td className="px-5 py-3 text-gray-400 text-sm">{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-primary-400 font-semibold text-sm">${b.totalAmount?.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[b.status] || 'bg-gray-500/15 text-gray-400'}`}>
                      {b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500 text-sm">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
