import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Spinner from '../../components/Spinner';
import API, { getAllBookings, updateBookingStatus, cancelBooking } from '../../services/api';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';
import CreateBookingModal from '../../components/CreateBookingModal';

const STATUS_STYLES = {
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/20',
  pending:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  completed: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

const PAYMENT_STYLES = {
  paid:     'text-green-400',
  pending:  'text-yellow-400',
  refunded: 'text-blue-400',
};

const assetUrl = (p) => {
  if (!p) return '';
  if (String(p).startsWith('http')) return p;
  const base = (API.defaults.baseURL || '').replace(/\/api\/?$/i, '');
  return `${base}${String(p).startsWith('/') ? '' : '/'}${p}`;
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    getAllBookings()
      .then(res => setBookings(res.data.bookings))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => bookings.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.bookingRef?.toLowerCase().includes(q) ||
        b.user?.name?.toLowerCase().includes(q) ||
        b.user?.email?.toLowerCase().includes(q) ||
        b.room?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  }), [bookings, filter, search]);

  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    try {
      if (status === 'cancelled') {
        await cancelBooking(id);
      } else {
        await updateBookingStatus(id, status);
      }
      setBookings(prev => prev.map(b => b._id === id ? {
        ...b,
        status,
        paymentStatus: status === 'cancelled' ? 'refunded' : b.paymentStatus
      } : b));
      if (selectedBooking?._id === id) setSelectedBooking(prev => ({ ...prev, status }));
      toast.success(`Booking status updated to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.totalAmount, 0);

  return (
    <AdminLayout title="Booking Management" subtitle={`${bookings.length} total bookings · ${formatINR(totalRevenue)} revenue`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          ['all', 'Total', bookings.length, 'text-white'],
          ['confirmed', 'Confirmed', bookings.filter(b => b.status === 'confirmed').length, 'text-green-400'],
          ['completed', 'Completed', bookings.filter(b => b.status === 'completed').length, 'text-blue-400'],
          ['cancelled', 'Cancelled', bookings.filter(b => b.status === 'cancelled').length, 'text-red-400'],
        ].map(([f, label, count, color]) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`card p-4 text-left transition-all hover:border-primary-800/30 ${filter === f ? 'border-primary-700/50' : ''}`}>
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-gray-500 text-xs mt-1">{label} Bookings</div>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by reference, guest name, email, or room..."
          className="input-field flex-1 text-sm" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field sm:w-44 text-sm">
          <option value="all">All Status</option>
          {['confirmed', 'pending', 'completed', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <button onClick={() => setCreateOpen(true)} className="btn-primary px-5 py-2.5 text-sm whitespace-nowrap">
          + Create Booking
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hotel-border">
                  {['Reference', 'Guest', 'Room', 'Dates', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hotel-border">
                {filtered.map(b => (
                  <tr key={b._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-4">
                      <button onClick={() => setSelectedBooking(b)} className="font-mono text-xs text-primary-400 hover:text-primary-300 transition-colors">
                        {b.bookingRef}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-900/40 flex items-center justify-center text-primary-400 text-xs font-bold flex-shrink-0">
                          {b.user?.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm truncate max-w-[120px]">{b.user?.name}</p>
                          <p className="text-gray-600 text-xs truncate max-w-[120px]">{b.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-gray-300 text-sm truncate max-w-[120px]">{b.room?.name}</p>
                      <p className="text-gray-600 text-xs">{b.room?.type}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-gray-300 text-xs">{new Date(b.checkIn).toLocaleDateString()}</p>
                      <p className="text-gray-500 text-xs">→ {new Date(b.checkOut).toLocaleDateString()}</p>
                      <p className="text-gray-600 text-xs">{b.totalNights}n</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-primary-400 font-bold text-sm">{formatINR(b.totalAmount)}</p>
                      <p className="text-gray-600 text-xs">{formatINR(b.pricePerNight)}/night</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-medium capitalize ${PAYMENT_STYLES[b.paymentStatus] || 'text-gray-400'}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`badge border text-xs ${STATUS_STYLES[b.status] || STATUS_STYLES.pending}`}>
                        {b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelectedBooking(b)}
                          className="text-xs px-2.5 py-1.5 border border-white/10 text-gray-400 rounded-lg hover:border-primary-500/50 hover:text-primary-400 transition-all">
                          View
                        </button>
                        {b.status === 'confirmed' && (
                          <button onClick={() => handleStatusChange(b._id, 'completed')} disabled={updating === b._id}
                            className="text-xs px-2.5 py-1.5 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500/5 transition-all disabled:opacity-50">
                            Complete
                          </button>
                        )}
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <button onClick={() => handleStatusChange(b._id, 'cancelled')} disabled={updating === b._id}
                            className="text-xs px-2.5 py-1.5 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/5 transition-all disabled:opacity-50">
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-14 text-gray-500 text-sm">No bookings match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="bg-hotel-card border border-hotel-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center p-5 border-b border-hotel-border">
              <div>
                <h3 className="text-white font-semibold">Booking Details</h3>
                <p className="font-mono text-primary-400 text-sm">{selectedBooking.bookingRef}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10">✕</button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {[
                ['Guest', selectedBooking.user?.name],
                ['Email', selectedBooking.user?.email],
                ['Phone', selectedBooking.guestInfo?.phone || selectedBooking.user?.phone || '—'],
                ['Room', selectedBooking.room?.name],
                ['Room Type', selectedBooking.room?.type],
                ['Check-In', new Date(selectedBooking.checkIn).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
                ['Check-Out', new Date(selectedBooking.checkOut).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
                ['Nights', selectedBooking.totalNights],
                ['Guests', `${selectedBooking.guests?.adults} adults, ${selectedBooking.guests?.children || 0} children`],
                ['Price/Night', formatINR(selectedBooking.pricePerNight)],
                ['Total Amount', formatINR(selectedBooking.totalAmount)],
                ['Payment', selectedBooking.paymentStatus],
                ['Booked On', new Date(selectedBooking.createdAt).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-white text-right max-w-[200px]">{v}</span>
                </div>
              ))}
              {selectedBooking.specialRequests && (
                <div className="bg-white/3 rounded-xl p-3 mt-2">
                  <p className="text-gray-500 text-xs mb-1">Special Requests:</p>
                  <p className="text-gray-300 text-xs">{selectedBooking.specialRequests}</p>
                </div>
              )}
              {selectedBooking.documents && Object.values(selectedBooking.documents).some(Boolean) && (
                <div className="bg-white/3 rounded-xl p-3 mt-2">
                  <p className="text-gray-500 text-xs mb-3">Documents:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedBooking.documents).filter(([, v]) => Boolean(v)).map(([k, v]) => (
                      <a key={k} href={assetUrl(v)} target="_blank" rel="noreferrer"
                        className="border border-white/10 rounded-xl overflow-hidden hover:border-primary-800/40 transition-colors">
                        <img src={assetUrl(v)} alt={k} className="w-full h-24 object-cover" />
                        <div className="px-2 py-1 text-[10px] text-gray-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-hotel-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Current Status</span>
                <span className={`badge border ${STATUS_STYLES[selectedBooking.status]}`}>
                  {selectedBooking.status?.charAt(0).toUpperCase() + selectedBooking.status?.slice(1)}
                </span>
              </div>
              {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                <div className="flex gap-2">
                  <button onClick={() => { handleStatusChange(selectedBooking._id, 'completed'); setSelectedBooking(null); }}
                    className="flex-1 text-sm py-2.5 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-500/5 transition-colors">
                    Mark Completed
                  </button>
                  <button onClick={() => { handleStatusChange(selectedBooking._id, 'cancelled'); setSelectedBooking(null); }}
                    className="flex-1 text-sm py-2.5 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/5 transition-colors">
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateBookingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(booking) => {
          if (!booking?._id) return;
          setBookings((prev) => [booking, ...prev]);
          setFilter('all');
          setSearch('');
        }}
      />
    </AdminLayout>
  );
}
