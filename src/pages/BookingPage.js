import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoom, createBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    checkIn: '', checkOut: '', adults: 1, children: 0,
    specialRequests: '', paymentMethod: 'card',
    cardNumber: '', cardName: '', cardExpiry: '', cardCVV: '',
  });
  const [errors, setErrors] = useState({});

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    getRoom(id).then(res => setRoom(res.data.room)).catch(() => toast.error('Room not found')).finally(() => setLoading(false));
  }, [id]);

  const set = (k, v) => { setForm(f => ({...f, [k]: v})); setErrors(e => ({...e, [k]: ''})); };

  const nights = () => {
    if (!form.checkIn || !form.checkOut) return 0;
    const d = (new Date(form.checkOut) - new Date(form.checkIn)) / 86400000;
    return d > 0 ? d : 0;
  };
  const n = nights();
  const subtotal = room ? room.price * n : 0;
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const validateStep1 = () => {
    const errs = {};
    if (!form.checkIn) errs.checkIn = 'Select check-in date';
    if (!form.checkOut) errs.checkOut = 'Select check-out date';
    else if (n < 1) errs.checkOut = 'Check-out must be after check-in';
    if (form.adults < 1) errs.adults = 'At least 1 adult required';
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (form.paymentMethod === 'card') {
      if (!form.cardNumber || form.cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Enter valid card number';
      if (!form.cardName.trim()) errs.cardName = 'Cardholder name required';
      if (!form.cardExpiry || !/^\d{2}\/\d{2}$/.test(form.cardExpiry)) errs.cardExpiry = 'Use MM/YY format';
      if (!form.cardCVV || form.cardCVV.length < 3) errs.cardCVV = 'Enter valid CVV';
    }
    return errs;
  };

  const nextStep = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const res = await createBooking({
        roomId: id, checkIn: form.checkIn, checkOut: form.checkOut,
        guests: { adults: form.adults, children: form.children },
        specialRequests: form.specialRequests, paymentMethod: form.paymentMethod,
      });
      toast.success('Booking confirmed!');
      navigate(`/booking-confirm/${res.data.booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  const formatCard = (v) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (v) => { const d = v.replace(/\D/g, ''); return d.length >= 2 ? `${d.slice(0,2)}/${d.slice(2,4)}` : d; };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Spinner size="lg" /></div>;
  if (!room) return <div className="min-h-screen flex items-center justify-center pt-20 text-gray-500">Room not found</div>;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-serif text-3xl text-white mb-2">Complete Your Booking</h1>
        <p className="text-gray-500 text-sm mb-8">Booking for <span className="text-primary-400">{room.name}</span></p>

        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-8">
          {[['1', 'Stay Details'], ['2', 'Payment']].map(([num, label], i) => (
            <React.Fragment key={num}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= Number(num) ? 'bg-primary-600 text-white' : 'bg-white/10 text-gray-500'}`}>{num}</div>
                <span className={`text-sm font-medium hidden sm:block ${step >= Number(num) ? 'text-white' : 'text-gray-600'}`}>{label}</span>
              </div>
              {i === 0 && <div className={`flex-1 h-0.5 transition-colors ${step >= 2 ? 'bg-primary-600' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Dates & Guests */}
            {step === 1 && (
              <div className="card p-6 space-y-5">
                <h2 className="text-white font-semibold text-lg">Stay Details</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Check-In Date *</label>
                    <input type="date" min={today} value={form.checkIn} onChange={e => set('checkIn', e.target.value)}
                      className={`input-field ${errors.checkIn ? 'border-red-500/50' : ''}`} />
                    {errors.checkIn && <p className="text-red-400 text-xs mt-1">{errors.checkIn}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Check-Out Date *</label>
                    <input type="date" min={form.checkIn || today} value={form.checkOut} onChange={e => set('checkOut', e.target.value)}
                      className={`input-field ${errors.checkOut ? 'border-red-500/50' : ''}`} />
                    {errors.checkOut && <p className="text-red-400 text-xs mt-1">{errors.checkOut}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Adults *</label>
                    <select value={form.adults} onChange={e => set('adults', Number(e.target.value))} className="input-field">
                      {[...Array(room.capacity)].map((_, i) => <option key={i+1} value={i+1}>{i+1} Adult{i > 0 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Children</label>
                    <select value={form.children} onChange={e => set('children', Number(e.target.value))} className="input-field">
                      {[0,1,2,3].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Child' : 'Children'}</option>)}
                    </select>
                  </div>
                </div>

                {/* Dynamic price preview */}
                {n > 0 && (
                  <div className="bg-primary-900/15 border border-primary-800/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-primary-400 text-sm font-medium mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Price Breakdown
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-gray-400">{formatINR(room.price)} × {n} night{n > 1 ? 's' : ''}</span><span className="text-white">{formatINR(subtotal)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Taxes & fees (12%)</span><span className="text-white">{formatINR(tax)}</span></div>
                      <div className="flex justify-between pt-2 border-t border-white/10 font-bold"><span className="text-white">Total</span><span className="text-primary-400 text-base">{formatINR(total)}</span></div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-gray-400 font-medium mb-1.5 block">Special Requests <span className="text-gray-600">(optional)</span></label>
                  <textarea value={form.specialRequests} onChange={e => set('specialRequests', e.target.value)}
                    placeholder="Late check-in, extra pillows, dietary requirements..." rows={3} className="input-field resize-none" />
                </div>

                <button onClick={nextStep} disabled={n < 1} className="btn-primary w-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="card p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <button type="button" onClick={() => setStep(1)} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <h2 className="text-white font-semibold text-lg">Payment Details</h2>
                </div>

                {/* Payment method selector */}
                <div className="grid grid-cols-2 gap-3">
                  {[['card', '💳 Credit Card'], ['paypal', '🅿️ PayPal']].map(([m, label]) => (
                    <button key={m} type="button" onClick={() => set('paymentMethod', m)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${form.paymentMethod === m ? 'border-primary-500 bg-primary-900/20 text-primary-400' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {form.paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1.5 block">Card Number</label>
                      <input type="text" value={form.cardNumber} onChange={e => set('cardNumber', formatCard(e.target.value))}
                        placeholder="1234 5678 9012 3456" maxLength={19} className={`input-field font-mono ${errors.cardNumber ? 'border-red-500/50' : ''}`} />
                      {errors.cardNumber && <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1.5 block">Cardholder Name</label>
                      <input type="text" value={form.cardName} onChange={e => set('cardName', e.target.value)}
                        placeholder="John Doe" className={`input-field ${errors.cardName ? 'border-red-500/50' : ''}`} />
                      {errors.cardName && <p className="text-red-400 text-xs mt-1">{errors.cardName}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 font-medium mb-1.5 block">Expiry Date</label>
                        <input type="text" value={form.cardExpiry} onChange={e => set('cardExpiry', formatExpiry(e.target.value))}
                          placeholder="MM/YY" maxLength={5} className={`input-field font-mono ${errors.cardExpiry ? 'border-red-500/50' : ''}`} />
                        {errors.cardExpiry && <p className="text-red-400 text-xs mt-1">{errors.cardExpiry}</p>}
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-medium mb-1.5 block">CVV</label>
                        <input type="text" value={form.cardCVV} onChange={e => set('cardCVV', e.target.value.replace(/\D/g,'').slice(0,4))}
                          placeholder="123" className={`input-field font-mono ${errors.cardCVV ? 'border-red-500/50' : ''}`} />
                        {errors.cardCVV && <p className="text-red-400 text-xs mt-1">{errors.cardCVV}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 p-3 bg-green-500/5 border border-green-500/15 rounded-lg">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      Your payment is 256-bit SSL encrypted and secure
                    </div>
                  </div>
                )}

                {form.paymentMethod === 'paypal' && (
                  <div className="text-center py-8 bg-blue-900/10 border border-blue-800/20 rounded-xl">
                    <div className="text-4xl mb-3">🅿️</div>
                    <p className="text-white font-medium">You'll be redirected to PayPal</p>
                    <p className="text-gray-500 text-sm mt-1">Complete your payment securely via PayPal</p>
                  </div>
                )}

                <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing Payment...
                    </span>
                  ) : `Confirm & Pay ${formatINR(total)}`}
                </button>
              </form>
            )}
          </div>

          {/* Summary Sidebar */}
          <div>
            <div className="card p-5 sticky top-24 space-y-4">
              <h3 className="text-white font-semibold">Booking Summary</h3>
              <img src={room.images?.[0]} alt={room.name} className="w-full h-36 object-cover rounded-xl"
                onError={e => { e.target.src='https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'; }} />
              <div>
                <p className="text-white font-semibold">{room.name}</p>
                <p className="text-gray-500 text-xs">{room.type} Room · Floor {room.floor}</p>
              </div>
              {form.checkIn && form.checkOut && n > 0 && (
                <div className="space-y-2 text-sm pt-3 border-t border-white/5">
                  <div className="flex justify-between"><span className="text-gray-500">Check-in</span><span className="text-white">{form.checkIn}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Check-out</span><span className="text-white">{form.checkOut}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Nights</span><span className="text-white">{n}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Guests</span><span className="text-white">{form.adults + form.children}</span></div>
                  <div className="flex justify-between pt-2 border-t border-white/5"><span className="text-gray-500">Subtotal</span><span className="text-white">{formatINR(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tax (12%)</span><span className="text-white">{formatINR(tax)}</span></div>
                  <div className="flex justify-between pt-2 border-t border-white/5 font-bold text-base"><span className="text-white">Total</span><span className="text-primary-400">{formatINR(total)}</span></div>
                </div>
              )}
              {(n < 1 || !form.checkIn) && (
                <p className="text-gray-600 text-xs text-center py-3">Select dates to see pricing</p>
              )}
              <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-white/5">
                <p>✓ Free cancellation until 24h before check-in</p>
                <p>✓ Instant booking confirmation</p>
                <p>✓ Best price guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
