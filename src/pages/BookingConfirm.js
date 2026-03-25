// BookingConfirm.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMyBookings } from '../services/api';
import Spinner from '../components/Spinner';

export function BookingConfirm() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings().then(res => {
      const b = res.data.bookings.find(b => b._id === id);
      setBooking(b);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Success animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/15 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-white mb-2">Booking Confirmed!</h1>
          <p className="text-gray-400">Your reservation has been successfully placed. Get ready for an amazing stay!</p>
        </div>

        {booking ? (
          <div className="card p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Booking Reference</p>
                <p className="text-primary-400 font-mono font-bold text-xl">{booking.bookingRef}</p>
              </div>
              <div className="px-3 py-1 bg-green-500/15 border border-green-500/20 text-green-400 text-xs font-medium rounded-full">✓ Confirmed</div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Room</span>
                <span className="text-white font-medium">{booking.room?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-In</span>
                <span className="text-white">{new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-Out</span>
                <span className="text-white">{new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="text-white">{booking.totalNights} Night{booking.totalNights > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Guests</span>
                <span className="text-white">{booking.guests?.adults} Adults{booking.guests?.children > 0 ? `, ${booking.guests.children} Children` : ''}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/5 text-base font-bold">
                <span className="text-white">Total Paid</span>
                <span className="text-primary-400">${booking.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-primary-900/10 border border-primary-800/20 rounded-xl p-4 text-xs text-gray-400">
              📧 A confirmation email has been sent to your registered email address.
            </div>
          </div>
        ) : (
          <div className="card p-6 text-center text-gray-500">Could not load booking details.</div>
        )}

        <div className="flex gap-3 mt-6">
          <Link to="/my-bookings" className="flex-1 btn-outline text-center py-3">View All Bookings</Link>
          <Link to="/rooms" className="flex-1 btn-primary text-center py-3">Browse More Rooms</Link>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirm;
