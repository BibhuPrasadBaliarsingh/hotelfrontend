import React, { useEffect, useState } from 'react';
import { getBookingDocuments } from '../services/api';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import API from '../services/api';

const assetUrl = (path) => {
  if (!path) return '';
  if (String(path).startsWith('http')) return path;
  const base = (API.defaults.baseURL || '').replace(/\/$/, '');
  return `${base}${String(path).startsWith('/') ? '' : '/'}${path}`;
};

export default function Documents() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = (search = '') => {
    setLoading(true);
    getBookingDocuments(search)
      .then((res) => setBookings(res.data.bookings))
      .catch(() => toast.error('Unable to load documents'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl text-white">Document Center</h1>
            <p className="text-gray-500 text-sm mt-2">Search, preview and download uploaded guest documents and payment slips.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by booking, guest, refer ID" className="input-field text-sm flex-1" />
            <button onClick={() => load(query)} className="btn-primary py-2.5 px-4 text-sm">Search</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="grid gap-4">
            {bookings.length === 0 ? (
              <div className="text-center py-20 text-gray-500">No documents found.</div>
            ) : bookings.map((booking) => (
              <div key={booking._id} className="card p-5 border border-white/10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-[0.18em] mb-1">Booking {booking.bookingRef}</p>
                    <p className="text-white font-semibold">{booking.guestInfo?.name || 'Guest'}</p>
                    <p className="text-gray-500 text-xs">{booking.guestInfo?.email || 'No email'} · {booking.guestInfo?.phone || 'No phone'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={assetUrl(booking.documents?.aadhaarFront)} target="_blank" rel="noreferrer" className="btn-outline py-2 px-3 text-xs">Preview Aadhaar</a>
                    <a href={assetUrl(booking.documents?.paymentSlip)} target="_blank" rel="noreferrer" className="btn-outline py-2 px-3 text-xs">Payment Slip</a>
                    <a href={assetUrl(booking.documents?.idProof)} target="_blank" rel="noreferrer" className="btn-outline py-2 px-3 text-xs" download>Download</a>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 text-sm text-gray-400">
                  <div><p className="text-gray-500 text-xs uppercase tracking-[0.18em] mb-1">Refer ID</p><p className="text-white">{booking.referId || '—'}</p></div>
                  <div><p className="text-gray-500 text-xs uppercase tracking-[0.18em] mb-1">Aadhaar</p><p className="text-white">{booking.aadhaarNumber || '—'}</p></div>
                  <div><p className="text-gray-500 text-xs uppercase tracking-[0.18em] mb-1">Room</p><p className="text-white">{booking.room?.name || '—'}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
