import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../services/api';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/20',
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  completed: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    getMyBookings().then(res => setBookings(res.data.bookings)).catch(() => toast.error('Failed to load bookings')).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? This action cannot be undone.')) return;
    setCancelling(id);
    try {
      await cancelBooking(id);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } : b));
      toast.success('Booking cancelled and refunded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally { setCancelling(null); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="min-h-screen pt-20">
      <div className="bg-hotel-card border-b border-hotel-border px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl text-white">My Bookings</h1>
          <p className="text-gray-500 mt-2 text-sm">{bookings.length} reservation{bookings.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-primary-900/40 text-primary-400 border border-primary-800/40' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-2 text-xs opacity-60">
                {f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-white font-semibold text-lg mb-2">{filter === 'all' ? 'No Bookings Yet' : `No ${filter} bookings`}</h3>
            <p className="text-gray-500 text-sm mb-6">Time to plan your next getaway!</p>
            <Link to="/rooms" className="btn-primary">Explore Rooms</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => (
              <div key={b._id} className="card p-5 hover:border-primary-800/30 transition-all duration-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Room Image */}
                  <div className="w-full sm:w-28 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={b.room?.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300'}
                      alt={b.room?.name} className="w-full h-full object-cover"
                      onError={e => { e.target.src='https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300'; }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-white font-semibold">{b.room?.name || 'Room'}</p>
                        <p className="text-gray-500 text-xs">{b.room?.type} · Ref: <span className="font-mono text-primary-400">{b.bookingRef}</span></p>
                      </div>
                      <span className={`badge border ${STATUS_STYLES[b.status] || STATUS_STYLES.pending}`}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
                      <div><p className="text-gray-600">Check-In</p><p className="text-white font-medium">{new Date(b.checkIn).toLocaleDateString()}</p></div>
                      <div><p className="text-gray-600">Check-Out</p><p className="text-white font-medium">{new Date(b.checkOut).toLocaleDateString()}</p></div>
                      <div><p className="text-gray-600">Nights</p><p className="text-white font-medium">{b.totalNights}</p></div>
                      <div><p className="text-gray-600">Guests</p><p className="text-white font-medium">{b.guests?.adults + (b.guests?.children || 0)}</p></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-primary-400 font-bold text-lg">${b.totalAmount?.toFixed(2)}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${b.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' : b.paymentStatus === 'refunded' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                          {b.paymentStatus}
                        </span>
                      </div>
                      {b.status === 'confirmed' && (
                        <button onClick={() => handleCancel(b._id)} disabled={cancelling === b._id}
                          className="text-xs px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/5 transition-colors disabled:opacity-50">
                          {cancelling === b._id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
