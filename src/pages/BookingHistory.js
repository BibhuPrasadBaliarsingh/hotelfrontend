import React, { useEffect, useState } from 'react';
import { getMyBookings } from '../services/api';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings()
      .then((res) => setBookings(res.data.bookings))
      .catch(() => toast.error('Failed to load booking history'))
      .finally(() => setLoading(false));
  }, []);

  const total = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl text-white">Booking History</h1>
            <p className="text-gray-500 mt-2 text-sm">Review all your past, current and upcoming stays.</p>
          </div>
          <div className="glass rounded-3xl border border-white/10 p-4 text-sm">
            <div className="text-gray-400 text-xs uppercase tracking-[0.18em] mb-2">Total value</div>
            <div className="text-white font-semibold text-xl">{formatINR(total)}</div>
            <div className="text-gray-500 text-xs mt-1">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-white font-medium text-lg">No booking history found</p>
            <p className="text-sm mt-2">Your reservations will appear here once completed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="card p-6 border border-white/10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">Booking reference</p>
                    <p className="text-white font-semibold">{booking.bookingRef}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">Status</p>
                    <p className="text-white font-medium capitalize">{booking.status}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm text-gray-400">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-[0.18em] mb-2">Room</p>
                    <p className="text-gray-100">{booking.room?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-[0.18em] mb-2">Dates</p>
                    <p className="text-gray-100">{new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-[0.18em] mb-2">Guests</p>
                    <p className="text-gray-100">{booking.guests?.adults} adults{booking.guests?.children ? `, ${booking.guests.children} children` : ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-[0.18em] mb-2">Paid</p>
                    <p className="text-primary-400 font-semibold">{formatINR(booking.totalAmount)}</p>
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
