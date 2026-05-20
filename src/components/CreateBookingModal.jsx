import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Spinner from './Spinner';
import { adminCreateBooking, getRooms } from '../services/api';
import CameraCapture from './CameraCapture';

const INPUT = 'input-field text-sm';

export default function CreateBookingModal({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [rooms, setRooms] = useState([]);

  const [form, setForm] = useState({
    roomIds: [],
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    paymentMethod: 'cash',
    customAmount: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestPassword: '',
    documents: { documentImage: '' },
  });

  useEffect(() => {
    if (!open) return;
    setRoomsLoading(true);
    const params = { available: 'true' };
    if (form.checkIn && form.checkOut) {
      params.checkIn = form.checkIn;
      params.checkOut = form.checkOut;
    }
    getRooms(params)
      .then((res) => setRooms(res.data.rooms || []))
      .catch(() => toast.error('Failed to load rooms'))
      .finally(() => setRoomsLoading(false));
  }, [open, form.checkIn, form.checkOut]);

  const selectedRooms = useMemo(
    () => rooms.filter((r) => form.roomIds.includes(r._id)),
    [rooms, form.roomIds]
  );

  useEffect(() => {
    if (!rooms.length || !form.roomIds.length) return;
    const availableIds = new Set(rooms.map((r) => r._id));
    const filteredRoomIds = form.roomIds.filter((id) => availableIds.has(id));
    if (filteredRoomIds.length !== form.roomIds.length) {
      setForm((prev) => ({ ...prev, roomIds: filteredRoomIds }));
    }
  }, [rooms, form.roomIds]);

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const setDoc = (value) => setForm((p) => ({ ...p, documents: { ...p.documents, documentImage: value } }));

  const totalNights = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 0;
    const ci = new Date(form.checkIn);
    const co = new Date(form.checkOut);
    const nights = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
    return Number.isFinite(nights) ? Math.max(0, nights) : 0;
  }, [form.checkIn, form.checkOut]);

  const totalAmount = useMemo(() => {
    if (!selectedRooms.length || !totalNights) return 0;
    return totalNights * selectedRooms.reduce((sum, room) => sum + (room.price || 0), 0);
  }, [selectedRooms, totalNights]);

  const effectiveTotal = form.customAmount ? Number(form.customAmount) : totalAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        roomIds: form.roomIds,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: { adults: Number(form.adults) || 1, children: Number(form.children) || 0 },
        specialRequests: form.specialRequests,
        paymentMethod: form.paymentMethod,
        customAmount: form.customAmount ? Number(form.customAmount) : 0,
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestPhone: form.guestPhone,
        guestPassword: form.guestPassword,
        documents: form.documents,
      };
      const res = await adminCreateBooking(payload);
      toast.success(res.data?.message || 'Booking created');
      const created = res.data?.bookings || (res.data?.booking ? [res.data.booking] : []);
      onCreated?.(created);
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="bg-hotel-card border border-hotel-border rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-hotel-border">
          <div>
            <h3 className="text-white font-semibold">Create Booking (Admin)</h3>
            <p className="text-gray-500 text-xs">Creates/uses guest account so they can log in and view booking.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 hide-scrollbar">
          {/* Guest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 text-xs">Guest Name *</label>
              <input className={INPUT} value={form.guestName} onChange={(e) => setField('guestName', e.target.value)} required />
            </div>
            <div>
              <label className="text-gray-500 text-xs">Guest Phone *</label>
              <input className={INPUT} value={form.guestPhone} onChange={(e) => setField('guestPhone', e.target.value)} required />
            </div>
            <div>
              <label className="text-gray-500 text-xs">Guest Email *</label>
              <input type="email" className={INPUT} value={form.guestEmail} onChange={(e) => setField('guestEmail', e.target.value)} required />
            </div>
            <div>
              <label className="text-gray-500 text-xs">Guest Password (min 6) *</label>
              <input type="password" className={INPUT} value={form.guestPassword} onChange={(e) => setField('guestPassword', e.target.value)} placeholder="Needed if this email is new" />
            </div>
          </div>

          {/* Booking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-gray-500 text-xs">Rooms *</label>
              {roomsLoading ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm"><Spinner /> Loading rooms...</div>
              ) : rooms.length === 0 ? (
                <div className="text-gray-400 text-sm">No available rooms for the selected dates. Update check-in/check-out to see available rooms.</div>
              ) : (
                <div className="grid gap-2 max-h-52 overflow-y-auto rounded-xl border border-white/10 p-3 bg-white/5">
                  {rooms.map((r) => (
                    <label key={r._id} className="flex items-center gap-3 text-sm text-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.roomIds.includes(r._id)}
                        onChange={(e) => {
                          const selected = new Set(form.roomIds);
                          if (e.target.checked) selected.add(r._id);
                          else selected.delete(r._id);
                          setField('roomIds', Array.from(selected));
                        }}
                        className="form-checkbox h-4 w-4 text-primary-500 rounded border-gray-600 bg-black"
                      />
                      <span>{r.name} · {r.type} · ₹{r.price}/night</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-gray-500 text-xs">Check-In *</label>
              <input type="date" className={INPUT} value={form.checkIn} onChange={(e) => setField('checkIn', e.target.value)} required />
            </div>
            <div>
              <label className="text-gray-500 text-xs">Check-Out *</label>
              <input type="date" className={INPUT} value={form.checkOut} onChange={(e) => setField('checkOut', e.target.value)} required />
            </div>
            <div>
              <label className="text-gray-500 text-xs">Adults</label>
              <input type="number" min="1" className={INPUT} value={form.adults} onChange={(e) => setField('adults', e.target.value)} />
            </div>
            <div>
              <label className="text-gray-500 text-xs">Children</label>
              <input type="number" min="0" className={INPUT} value={form.children} onChange={(e) => setField('children', e.target.value)} />
            </div>
            <div>
              <label className="text-gray-500 text-xs">Payment Method</label>
              <select className={INPUT} value={form.paymentMethod} onChange={(e) => setField('paymentMethod', e.target.value)}>
                {['cash', 'card', 'upi'].map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-xs">Admin override total</label>
              <input
                type="number"
                min="0"
                className={INPUT}
                value={form.customAmount}
                onChange={(e) => setField('customAmount', e.target.value)}
                placeholder="Enter custom total"
              />
              <p className="text-gray-400 text-[11px] mt-1">Only admins can override the estimate total for relatives or special guests.</p>
            </div>
            <div className="flex items-end justify-between bg-white/3 rounded-xl px-4 py-3 border border-white/5">
              <div>
                <div className="text-gray-500 text-xs">Estimated Total</div>
                <div className="text-white font-semibold text-lg">₹{effectiveTotal}</div>
              </div>
              <div className="text-gray-500 text-xs text-right">
                {totalNights} night{totalNights !== 1 ? 's' : ''}<br />
                {selectedRooms.length} room{selectedRooms.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-500 text-xs">Special Requests</label>
              <textarea className={INPUT} rows={2} value={form.specialRequests} onChange={(e) => setField('specialRequests', e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-[0.16em]">Document Capture</p>
                <p className="text-gray-400 text-[11px]">Capture or upload a document image for booking verification.</p>
              </div>
            </div>
            <CameraCapture
              label="Document Image"
              value={form.documents.documentImage}
              onChange={setDoc}
              className="min-h-[170px]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-outline">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
