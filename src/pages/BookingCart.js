import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createBulkBooking } from '../services/api';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';

export default function BookingCart() {
  const { user } = useAuth();
  const { items, updateItem, removeItem, clearCart, subtotal, gst, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [customAmount, setCustomAmount] = useState('');
  const [invoiceNote, setInvoiceNote] = useState('');
  const navigate = useNavigate();

  const cartTotal = useMemo(() => {
    const base = total;
    if (user?.role === 'admin') return customAmount ? Number(customAmount) : base;
    return base;
  }, [customAmount, total, user]);

  const handleQuantity = (roomId, delta) => {
    const item = items.find((entry) => entry.room._id === roomId);
    if (!item) return;
    const next = Math.max(1, item.quantity + delta);
    updateItem(roomId, { quantity: next });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) return toast.error('Add at least one room to the cart');
    setLoading(true);
    try {
      const overallCustom = user?.role === 'admin' ? (customAmount || 0) : 0;
      const payload = {
        items: items.map((item) => ({
          roomId: item.room._id,
          quantity: item.quantity,
          checkIn: item.checkIn || new Date().toISOString().slice(0, 10),
          checkOut: item.checkOut || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          adults: item.adults,
          children: item.children,
          customAmount: user?.role === 'admin' ? (item.customAmount || overallCustom || 0) : 0,
          paymentMethod,
          paymentStatus,
          checkInTime: item.checkInTime || '14:00',
          checkOutTime: item.checkOutTime || '11:00',
          specialRequests: invoiceNote,
        })),
        paymentMethod,
        paymentStatus,
        customAmount: overallCustom,
      };
      const res = await createBulkBooking(payload);
      toast.success(res.data.message || 'Booking confirmed');
      clearCart();
      navigate('/booking-history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking cart checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="text-center max-w-xl">
          <h1 className="font-serif text-4xl text-white mb-4">Your booking cart is empty</h1>
          <p className="text-gray-500 mb-6">Browse rooms and add multiple categories to reserve them in one smooth flow.</p>
          <button onClick={() => navigate('/rooms')} className="btn-primary py-3 px-8">Browse Rooms</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1 card p-6">
            <h1 className="font-serif text-3xl text-white mb-2">Booking Bucket</h1>
            <p className="text-gray-500 text-sm">Manage room quantities, dates, and payment details before checkout.</p>
            <div className="mt-6 space-y-4">
              {items.map((item) => {
                const nights = item.checkIn && item.checkOut ? Math.max(1, Math.ceil((new Date(item.checkOut) - new Date(item.checkIn)) / 86400000)) : 1;
                const itemTotal = item.room.price * item.quantity * nights;
                return (
                  <div key={item.room._id} className="glass p-4 rounded-3xl border border-white/10">
                    <div className="flex flex-col gap-4 md:items-center md:flex-row md:justify-between">
                      <div>
                        <p className="text-white font-semibold">{item.room.name}</p>
                        <p className="text-gray-500 text-xs">{item.room.type} · {item.room.capacity} guests</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleQuantity(item.room._id, -1)} className="btn-outline px-3 py-2">-</button>
                        <span className="text-white font-semibold">{item.quantity}</span>
                        <button onClick={() => handleQuantity(item.room._id, 1)} className="btn-outline px-3 py-2">+</button>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 mt-4 text-sm text-gray-400">
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-[0.18em] mb-1">Check-In</p>
                        <input type="date" value={item.checkIn} onChange={(e) => updateItem(item.room._id, { checkIn: e.target.value })} className="input-field text-sm" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-[0.18em] mb-1">Check-Out</p>
                        <input type="date" value={item.checkOut} onChange={(e) => updateItem(item.room._id, { checkOut: e.target.value })} className="input-field text-sm" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-[0.18em] mb-1">Guests</p>
                        <div className="flex gap-2">
                          <input type="number" min="1" value={item.adults} onChange={(e) => updateItem(item.room._id, { adults: Number(e.target.value) })} className="input-field text-sm" placeholder="Adults" />
                          <input type="number" min="0" value={item.children} onChange={(e) => updateItem(item.room._id, { children: Number(e.target.value) })} className="input-field text-sm" placeholder="Children" />
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-[0.18em] mb-1">Room total</p>
                        <p className="text-white font-medium">{formatINR(itemTotal)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-4">
                      <button onClick={() => removeItem(item.room._id)} className="btn-ghost py-2 text-xs">Remove</button>
                      <p className="text-gray-400 text-xs">{nights} night{nights !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-[360px] space-y-4">
            <div className="card p-6 space-y-4">
              <h2 className="text-white font-semibold text-xl">Order Summary</h2>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
                <div className="flex justify-between"><span>GST 12%</span><span>{formatINR(gst)}</span></div>
                <div className="flex justify-between font-semibold text-white border-t border-white/10 pt-3"><span>Total</span><span>{formatINR(cartTotal)}</span></div>
              </div>
              {user?.role === 'admin' && (
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-[0.18em] mb-2 block">Custom amount</label>
                  <input type="number" min="0" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder="Override total" className="input-field text-sm" />
                </div>
              )}
            </div>

            <div className="card p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-[0.18em] mb-2 block">Payment method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field text-sm">
                  {['cash', 'upi', 'card', 'netbanking'].map((method) => (
                    <option key={method} value={method}>{method.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-[0.18em] mb-2 block">Payment status</label>
                <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="input-field text-sm">
                  {['paid', 'due', 'pending'].map((status) => (
                    <option key={status} value={status}>{status.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-[0.18em] mb-2 block">Reception notes</label>
                <textarea value={invoiceNote} onChange={(e) => setInvoiceNote(e.target.value)} rows={3} className="input-field text-sm resize-none" placeholder="Add a note for reception or billing" />
              </div>
              <div className="bg-white/5 rounded-3xl border border-white/10 p-4 text-sm text-gray-400">
                <p className="text-xs uppercase tracking-[0.18em] mb-3 text-gray-500">Booking preview</p>
                <p><span className="text-white">{items.length}</span> room type{items.length !== 1 ? 's' : ''} · {user?.name}</p>
                <p className="mt-2 text-gray-500">Charges will reflect in your guest profile after checkout.</p>
              </div>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Confirming...' : `Confirm ${formatINR(cartTotal)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
