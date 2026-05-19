import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getBookingDocuments } from '../../services/api';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import API from '../../services/api';

const assetUrl = (path) => {
  if (!path) return '';
  if (String(path).startsWith('http')) return path;
  const base = (API.defaults.baseURL || '').replace(/\/$/, '');
  return `${base}${String(path).startsWith('/') ? '' : '/'}${path}`;
};

export default function AdminDocuments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadDocuments = (query = '') => {
    setLoading(true);
    getBookingDocuments(query)
      .then((res) => setBookings(res.data.bookings || []))
      .catch(() => toast.error('Failed to load documents'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <AdminLayout title="Document Center" subtitle="View booking documents, IDs, and guest uploads">
      <div className="space-y-6">
        <div className="card p-5 border border-white/10 bg-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-white font-semibold text-xl">Booking documents</h2>
              <p className="text-gray-400 text-sm mt-1">Search and access guest documents uploaded for reservations.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by guest, booking ref, or room"
                className="input-field text-sm w-full sm:w-72"
              />
              <button
                onClick={() => loadDocuments(search)}
                className="btn-primary py-2 px-4 text-sm"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : bookings.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">No booking documents found.</div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="card p-5 border border-white/10 bg-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-white text-lg font-semibold truncate">{booking.guestInfo?.name || booking.user?.name || 'Guest'}</p>
                    <p className="text-gray-500 text-sm truncate">{booking.room?.name || booking.bookingRef || 'Booking'}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">{booking.bookingRef || booking._id}</p>
                    <p className="text-gray-500 text-xs">{booking.room?.type || 'Room details'}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {booking.documents && Object.entries(booking.documents).filter(([, value]) => value).length > 0 ? (
                    Object.entries(booking.documents)
                      .filter(([, value]) => value)
                      .map(([key, value]) => (
                        <a
                          key={key}
                          href={assetUrl(value)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-outline text-xs py-2 px-3 text-left"
                        >
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </a>
                      ))
                  ) : (
                    <div className="text-gray-500 text-sm">No documents uploaded for this booking.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
