import React, { useEffect, useState } from 'react';
import { getBookingDocuments } from '../services/api';
import Spinner from './Spinner';
import toast from 'react-hot-toast';
import API from '../services/api';

const assetUrl = (path) => {
  if (!path) return '';
  if (String(path).startsWith('http')) return path;
  const base = (API.defaults.baseURL || '').replace(/\/$/, '');
  return `${base}${String(path).startsWith('/') ? '' : '/'}${path}`;
};

const formatSafeDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const getGuestLabel = (booking) => booking.guestInfo?.name || booking.user?.name || 'Guest';
const getGuestContact = (booking) => booking.guestInfo?.email || booking.user?.email || 'No email';

export default function AdminDocumentsPanel({ onClose, booking }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = (q = '') => {
    setLoading(true);
    getBookingDocuments(q)
      .then(res => setDocs(res.data.bookings || []))
      .catch(() => toast.error('Unable to load documents'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="card p-4 mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-white font-semibold text-sm">Document Center</h4>
          <p className="text-gray-400 text-xs mt-1">Recent guest documents and payment slips</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg">✕</button>
        )}
      </div>

      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '70vh' }}>
        {booking ? (
          <div className="space-y-3">
            <div className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-white font-semibold">{getGuestLabel(booking)}</p>
                  <p className="text-gray-400 text-xs">{booking.room?.name || booking.referId || booking.bookingRef}</p>
                  <p className="text-gray-400 text-xs mt-1">{formatSafeDate(booking.checkIn)} → {formatSafeDate(booking.checkOut)}</p>
                  <p className="text-gray-400 text-xs mt-1">Amount: {booking.totalAmount ? booking.totalAmount : '—'}</p>
                  <p className="text-gray-400 text-xs mt-1">{getGuestContact(booking)} · {booking.guestInfo?.phone || booking.user?.phone || 'No phone'}</p>
                </div>
                <div className="text-right text-xs text-gray-400">{new Date(booking.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="card p-3">
              <h5 className="text-white font-semibold text-sm mb-2">Documents</h5>
              <div className="grid gap-2">
                {booking.documents && Object.entries(booking.documents).filter(([, v]) => Boolean(v)).map(([k, v]) => (
                  <a key={k} href={assetUrl(v)} target="_blank" rel="noreferrer" className="btn-outline text-xs py-1 px-2 text-left">{k.replace(/([A-Z])/g, ' $1')}</a>
                ))}
                {(!booking.documents || Object.values(booking.documents).every(v => !v)) && (
                  <div className="text-gray-500 text-xs">No documents uploaded for this booking.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          loading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : docs.length === 0 ? (
            <div className="text-center text-gray-500 py-6">No documents found</div>
          ) : docs.map((b) => (
            <div key={b._id} className="card p-3 border border-white/6 flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                <img src={assetUrl(b.documents?.aadhaarFront || b.documents?.idProof || b.documents?.paymentSlip)} alt="doc" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-white text-sm truncate">{b.guestInfo?.name || b.user?.name || 'Guest'}</p>
                    <p className="text-gray-500 text-xs truncate">{b.room?.name || b.referId || b.bookingRef}</p>
                  </div>
                  <div className="text-right text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2 mt-2">
                  <a href={assetUrl(b.documents?.aadhaarFront)} target="_blank" rel="noreferrer" className="btn-outline text-xs py-1 px-2">Aadhaar</a>
                  <a href={assetUrl(b.documents?.paymentSlip)} target="_blank" rel="noreferrer" className="btn-outline text-xs py-1 px-2">Slip</a>
                  <a href={assetUrl(b.documents?.idProof)} target="_blank" rel="noreferrer" className="btn-outline text-xs py-1 px-2">Download</a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
