import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getGuestSession } from '../services/api';
import { getMyBookings } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';

export default function GuestDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getGuestSession(), getMyBookings()])
      .then(([sessionRes, myRes]) => {
        setSession(sessionRes.data.session);
        setBookings(myRes.data.bookings);
      })
      .catch(() => toast.error('Unable to load guest dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] mb-8">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-[0.24em] mb-2">Guest Dashboard</p>
                <h1 className="font-serif text-3xl text-white">Welcome, {user?.name.split(' ')[0]}</h1>
                <p className="text-gray-500 mt-2 text-sm">Your stay progress and booking summary are centralised here.</p>
              </div>
              <button onClick={() => navigate('/booking-cart')} className="btn-primary text-sm py-2.5">Open Booking Cart</button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass p-4 rounded-3xl border border-white/10">
                <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-3">Refer ID</p>
                <p className="text-white font-semibold text-lg">{session?.referId || '—'}</p>
              </div>
              <div className="glass p-4 rounded-3xl border border-white/10">
                <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-3">Check-in</p>
                <p className="text-white font-semibold text-lg">{new Date(session?.checkInDate).toLocaleDateString()}</p>
                <p className="text-gray-500 text-xs mt-1">{session?.checkInTime || 'Any time'}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="glass p-4 rounded-3xl border border-white/10">
                <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-3">Session status</p>
                <p className="text-white font-semibold text-lg capitalize">{session?.status || 'pending'}</p>
                <p className="text-gray-500 text-xs mt-1">Auto-saved with your guest profile.</p>
              </div>
              <div className="glass p-4 rounded-3xl border border-white/10">
                <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-3">Bookings history</p>
                <p className="text-white font-semibold text-lg">{bookings.length}</p>
                <p className="text-gray-500 text-xs mt-1">Past and upcoming reservations</p>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-primary-950/90 to-primary-900/70 border border-primary-800/40">
            <p className="text-xs text-primary-300 uppercase tracking-[0.24em] mb-4">Guest snapshot</p>
            <div className="space-y-4">
              <div className="glass p-4 rounded-3xl border border-white/10">
                <p className="text-gray-400 text-xs uppercase tracking-[0.18em] mb-2">Mobile number</p>
                <p className="text-white font-medium">{session?.user?.phone || user?.phone || 'Not provided'}</p>
              </div>
              <div className="glass p-4 rounded-3xl border border-white/10">
                <p className="text-gray-400 text-xs uppercase tracking-[0.18em] mb-2">Aadhaar / ID proof</p>
                <p className="text-white font-medium">{session?.aadhaarNumber || 'Pending upload'}</p>
              </div>
              <div className="glass p-4 rounded-3xl border border-white/10">
                <p className="text-gray-400 text-xs uppercase tracking-[0.18em] mb-2">Verified guest</p>
                <p className="text-white font-medium">Yes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-semibold text-xl">Upcoming activity</h2>
                <p className="text-gray-500 text-sm">Your latest reservation details and booking links.</p>
              </div>
              <Link to="/booking-history" className="text-primary-400 text-sm hover:text-primary-300">View full history →</Link>
            </div>
            {bookings.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-white font-medium mb-2">No bookings yet</p>
                <p className="text-sm">Begin by adding rooms to your booking cart.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 4).map((booking) => (
                  <div key={booking._id} className="glass p-4 rounded-3xl border border-white/10 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold">{booking.room?.name || 'Room booking'}</p>
                      <p className="text-gray-500 text-xs">Ref: {booking.bookingRef}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary-400 font-semibold">{formatINR(booking.totalAmount)}</p>
                      <p className="text-gray-500 text-xs">{new Date(booking.checkIn).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-white font-semibold text-xl mb-4">Quick actions</h2>
            <div className="space-y-3">
              <button onClick={() => navigate('/booking-cart')} className="btn-primary w-full py-3 text-sm">Open Room Cart</button>
              <Link to="/rooms" className="btn-outline block text-center py-3 text-sm">Browse Rooms</Link>
              <Link to="/my-bookings" className="btn-ghost block text-center py-3 text-sm">Go to My Bookings</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
