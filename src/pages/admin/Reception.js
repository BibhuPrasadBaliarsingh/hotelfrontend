import React, { useEffect, useState } from 'react';
import { getAllBookings } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

export default function AdminReception() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBookings()
      .then((res) => setBookings(res.data.bookings))
      .catch(() => toast.error('Unable to load reception board'))
      .finally(() => setLoading(false));
  }, []);

  const active = bookings.filter((b) => b.status === 'confirmed');

  return (
    <AdminLayout title="Reception Desk" subtitle="Room allotment, check-in, payment and verification at a glance">
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card bg-primary-900/20 border-primary-800/30 text-primary-400">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Active check-ins</p>
              <p className="text-3xl font-semibold">{active.length}</p>
              <p className="text-gray-500 text-xs mt-2">Guests currently pending assignment.</p>
            </div>
            <div className="stat-card bg-green-900/20 border-green-800/30 text-green-400">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Upcoming stays</p>
              <p className="text-3xl font-semibold">{bookings.filter((b) => new Date(b.checkIn) > new Date()).length}</p>
              <p className="text-gray-500 text-xs mt-2">Future arrivals to manage.</p>
            </div>
            <div className="stat-card bg-yellow-900/20 border-yellow-800/30 text-yellow-400">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Pending payments</p>
              <p className="text-3xl font-semibold">{bookings.filter((b) => b.paymentStatus === 'due' || b.paymentStatus === 'pending').length}</p>
              <p className="text-gray-500 text-xs mt-2">Updates required before departure.</p>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-semibold text-xl">Recent Reception Tasks</h2>
                <p className="text-gray-500 text-sm">Review guest verification and room assignments.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-hotel-border text-gray-500 uppercase tracking-[0.18em] text-xs">
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Check-In</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Booking Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hotel-border">
                  {bookings.slice(0, 10).map((booking) => (
                    <tr key={booking._id} className="hover:bg-white/5">
                      <td className="px-4 py-4 text-white">{booking.guestInfo?.name || booking.user?.name}</td>
                      <td className="px-4 py-4 text-gray-400">{booking.room?.name || 'Room'}</td>
                      <td className="px-4 py-4 text-gray-400">{new Date(booking.checkIn).toLocaleDateString()}</td>
                      <td className={`px-4 py-4 text-sm ${booking.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>{booking.paymentStatus}</td>
                      <td className="px-4 py-4 font-mono text-xs text-primary-400">{booking.bookingRef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
