import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  const [checkedInMap, setCheckedInMap] = useState({});
  const [checkedOutMap, setCheckedOutMap] = useState({});
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    getAllBookings()
      .then(res => setBookings(res.data.bookings))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  // Listen for openBookingPanel global events to show booking details in right-side panel
  useEffect(() => {
    const handler = (e) => setSelectedBooking(e?.detail || null);
    window.addEventListener('openBookingPanel', handler);
    return () => window.removeEventListener('openBookingPanel', handler);
  }, []);

  const filtered = useMemo(() => bookings.filter(b => {
    if (filter !== 'all') {
      if (filter === 'future') {
        if (b.status === 'cancelled') return false;
        if (new Date(b.checkOut) < new Date()) return false;
      } else if (filter === 'paid') {
        if (b.paymentStatus !== 'paid') return false;
      } else if (filter === 'pendingPayments') {
        if (b.paymentStatus === 'paid' || b.paymentStatus === 'refunded') return false;
      } else if (['confirmed', 'pending', 'completed', 'cancelled'].includes(filter)) {
        if (b.status !== filter) return false;
      }
    }
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

  const handleCheckIn = (booking) => {
    const paymentMessage = booking.paymentStatus === 'paid'
      ? `Payment completed: ${formatINR(booking.totalAmount)}`
      : `Payment pending: ${formatINR(booking.totalAmount)} (${booking.paymentStatus})`;

    setSelectedBooking(booking);
    setCheckedInMap(prev => ({ ...prev, [booking._id]: new Date().toISOString() }));
    toast.success(`Checked in ${booking.bookingRef}. ${paymentMessage}`);
  };

  const handleCheckout = async (booking) => {
    if (booking.paymentStatus !== 'paid') {
      toast.error('Payment is not complete. Cannot checkout.');
      return;
    }
    if (!checkedInMap[booking._id]) {
      toast.error('Please check in the booking before checkout.');
      return;
    }

    setUpdating(booking._id);
    try {
      await updateBookingStatus(booking._id, 'completed');
      setCheckedOutMap(prev => ({ ...prev, [booking._id]: new Date().toISOString() }));
      setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: 'completed' } : b));
      if (selectedBooking?._id === booking._id) setSelectedBooking(prev => ({ ...prev, status: 'completed' }));
      toast.success('Checkout completed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setUpdating(null);
    }
  };

  const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.totalAmount, 0);
  const futureBookingCount = bookings.filter((b) => b.status !== 'cancelled' && new Date(b.checkOut) >= new Date()).length;
  const paidCount = bookings.filter(b => b.paymentStatus === 'paid').length;
  const pendingPaymentCount = bookings.filter(b => b.paymentStatus !== 'paid' && b.paymentStatus !== 'refunded').length;

  return (
    <AdminLayout title="Booking Management" subtitle={`${bookings.length} total bookings · ${formatINR(totalRevenue)} revenue`}>
      <div className="card p-5 mb-6 border border-primary-500/10 bg-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-white font-semibold text-lg">Monthly revenue export and future booking reports</h2>
            <p className="text-gray-400 text-sm mt-2">Use Reports for XLSX exports, and Calendar for an at-a-glance future booking schedule.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/management" className="btn-primary py-2 px-4 text-sm">Export Revenue</Link>
            <Link to="/admin/calendar" className="btn-outline py-2 px-4 text-sm">Future Booking Calendar</Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 mb-6">
        {[
          ['all', 'Total', bookings.length, 'text-white'],
          ['confirmed', 'Confirmed', bookings.filter(b => b.status === 'confirmed').length, 'text-green-400'],
          ['completed', 'Completed', bookings.filter(b => b.status === 'completed').length, 'text-blue-400'],
          ['future', 'Future', futureBookingCount, 'text-purple-400'],
          ['cancelled', 'Cancelled', bookings.filter(b => b.status === 'cancelled').length, 'text-red-400'],
          ['paid', 'Paid', paidCount, 'text-green-400'],
          ['pendingPayments', 'Pending', pendingPaymentCount, 'text-yellow-400'],
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
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field sm:w-56 text-sm">
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pendingPayments">Pending Payment</option>
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
                  {['Reference', 'Guest', 'Room', 'Check In', 'Check Out', 'Adults', 'Children', 'Nights', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hotel-border">
                {filtered.map(b => (
                  <tr key={b._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-4">
                      <button onClick={() => window.dispatchEvent(new CustomEvent('openBookingPanel', { detail: b }))} className="font-mono text-xs text-primary-400 hover:text-primary-300 transition-colors">
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
                      {checkedInMap[b._id] && (
                        <p className="text-emerald-300 text-[11px] mt-1">Checked in: {new Date(checkedInMap[b._id]).toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-gray-500 text-xs">{new Date(b.checkOut).toLocaleDateString()}</p>
                      {checkedOutMap[b._id] && (
                        <p className="text-sky-300 text-[11px] mt-1">Checked out: {new Date(checkedOutMap[b._id]).toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white text-sm">{b.guests?.adults ?? 0}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white text-sm">{b.guests?.children ?? 0}</p>
                    </td>
                    <td className="px-4 py-4">
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
                        <button onClick={() => window.dispatchEvent(new CustomEvent('openBookingPanel', { detail: b }))}
                          className="text-xs px-2.5 py-1.5 border border-white/10 text-gray-400 rounded-lg hover:border-primary-500/50 hover:text-primary-400 transition-all">
                          View
                        </button>
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <button onClick={() => handleCheckIn(b)} disabled={updating === b._id}
                            className="text-xs px-2.5 py-1.5 border border-blue-500/20 text-sky-400 rounded-lg hover:bg-sky-500/5 transition-all disabled:opacity-50">
                            {checkedInMap[b._id] ? 'Checked In' : 'Check In'}
                          </button>
                        )}
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <button onClick={() => handleCheckout(b)} disabled={updating === b._id || b.paymentStatus !== 'paid' || !checkedInMap[b._id]}
                            className={`text-xs px-2.5 py-1.5 border rounded-lg transition-all disabled:opacity-50 ${b.paymentStatus === 'paid' && checkedInMap[b._id] ? 'border-green-500/20 text-green-400 hover:bg-green-500/5' : 'border-yellow-500/20 text-yellow-400 bg-black/5'}`}>
                            {b.paymentStatus === 'paid' && checkedInMap[b._id] ? 'Check Out' : 'Checkout Due'}
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
                  <tr><td colSpan={12} className="text-center py-14 text-gray-500 text-sm">No bookings match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Detail Panel (right) - opens when a booking is selected via the global event */}
      {selectedBooking && (
        <aside className="fixed right-4 top-20 w-96 max-h-[80vh] overflow-y-auto bg-hotel-card border border-hotel-border rounded-2xl p-4 z-50 shadow-2xl">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-white font-semibold">Booking Details</h3>
              <p className="text-gray-400 text-xs">{selectedBooking.bookingRef}</p>
            </div>
            <div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-white text-sm">Close</button>
            </div>
          </div>
          <div className="space-y-3 text-sm text-gray-400">
            <div>
              <div className="text-gray-500 text-xs">Guest</div>
              <div className="text-white">{selectedBooking.user?.name} · {selectedBooking.user?.email}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Room</div>
              <div className="text-white">{selectedBooking.room?.name} · {selectedBooking.room?.type}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Dates</div>
              <div className="text-white">{new Date(selectedBooking.checkIn).toLocaleDateString()} → {new Date(selectedBooking.checkOut).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Nights</div>
              <div className="text-white">{selectedBooking.totalNights}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Amount</div>
              <div className="text-primary-400">{formatINR(selectedBooking.totalAmount)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Payment status</div>
              <div className={`${PAYMENT_STYLES[selectedBooking.paymentStatus] || 'text-gray-400'}`}>{selectedBooking.paymentStatus}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Status</div>
              <div className={`badge border text-xs ${STATUS_STYLES[selectedBooking.status] || ''}`}>{selectedBooking.status}</div>
            </div>
            <div className="pt-2 flex gap-2">
              {selectedBooking.status === 'confirmed' && (
                <button onClick={() => handleStatusChange(selectedBooking._id, 'completed')} disabled={updating === selectedBooking._id}
                  className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm">Complete</button>
              )}
              {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                <button onClick={() => handleStatusChange(selectedBooking._id, 'cancelled')} disabled={updating === selectedBooking._id}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm">Cancel</button>
              )}
            </div>
          </div>
        </aside>
      )}

      <CreateBookingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(createdBookings) => {
          const bookingsToAdd = Array.isArray(createdBookings) ? createdBookings : [createdBookings];
          if (!bookingsToAdd.length || !bookingsToAdd[0]?._id) return;
          setBookings((prev) => [...bookingsToAdd, ...prev]);
          setFilter('all');
          setSearch('');
        }}
      />
    </AdminLayout>
  );
}
