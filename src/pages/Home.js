import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRooms } from '../services/api';
import RoomCard from '../components/RoomCard';
import Spinner from '../components/Spinner';

const AMENITIES = [
  { icon: '🏊', label: 'Infinity Pool', desc: 'Rooftop infinity pool with panoramic views' },
  { icon: '🍽️', label: 'Fine Dining', desc: 'Award-winning restaurant & rooftop bar' },
  { icon: '💆', label: 'Luxury Spa', desc: 'Full-service spa & wellness center' },
  { icon: '🏋️', label: 'Fitness Center', desc: 'State-of-the-art gym, open 24/7' },
  { icon: '🚗', label: 'Valet Parking', desc: 'Complimentary valet for all guests' },
  { icon: '✈️', label: 'Airport Transfer', desc: 'Private limousine service available' },
];

const TESTIMONIALS = [
  { name: 'Alexandra Chen', country: 'Singapore', rating: 5, text: 'Absolutely breathtaking experience. The staff went above and beyond to make our anniversary unforgettable. Will definitely be back!', stay: 'Presidential Suite' },
  { name: 'Marcus Weber', country: 'Germany', rating: 5, text: 'From the moment we arrived, every detail was perfect. The Deluxe Ocean View room was stunning — the sunrise view from our balcony was magical.', stay: 'Deluxe Ocean View' },
  { name: 'Sofia Rossi', country: 'Italy', rating: 5, text: 'LuxeStay redefined luxury for me. Exceptional service, incredible food, and the most comfortable bed I\'ve ever slept in. Pure perfection.', stay: 'Luxury Suite' },
];

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchForm, setSearchForm] = useState({ checkIn: '', checkOut: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    getRooms({ available: true })
      .then(res => setRooms(res.data.rooms.slice(0, 6)))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchForm.checkIn) params.set('checkIn', searchForm.checkIn);
    if (searchForm.checkOut) params.set('checkOut', searchForm.checkOut);
    if (searchForm.type) params.set('type', searchForm.type);
    navigate(`/rooms?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80" alt="Hero" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-hotel-dark/60 via-hotel-dark/30 to-hotel-dark" />
          <div className="absolute inset-0 bg-gradient-to-r from-hotel-dark/80 via-transparent to-hotel-dark/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-primary-300 mb-6 border border-primary-800/30">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              Award-Winning Luxury Hotel
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
              Your Perfect<br />
              <span className="gold-text">Escape Awaits</span>
            </h1>

            <p className="text-gray-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
              Indulge in unparalleled luxury. Every room tells a story, every moment becomes a cherished memory at LuxeStay.
            </p>

            {/* Search Card */}
            <div className="glass border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl">
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block uppercase tracking-wider">Check In</label>
                    <input type="date" min={today} value={searchForm.checkIn}
                      onChange={e => setSearchForm(f => ({ ...f, checkIn: e.target.value }))}
                      className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block uppercase tracking-wider">Check Out</label>
                    <input type="date" min={searchForm.checkIn || today} value={searchForm.checkOut}
                      onChange={e => setSearchForm(f => ({ ...f, checkOut: e.target.value }))}
                      className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block uppercase tracking-wider">Room Type</label>
                    <select value={searchForm.type} onChange={e => setSearchForm(f => ({ ...f, type: e.target.value }))}
                      className="input-field text-sm">
                      <option value="">All Types</option>
                      {['Single', 'Double', 'Deluxe', 'Suite'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full mt-4 py-3.5 text-base">
                  Search Available Rooms →
                </button>
              </form>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-8">
              {[['500+', 'Happy Guests'], ['50+', 'Luxury Rooms'], ['4.9★', 'Average Rating'], ['24/7', 'Guest Support']].map(([v, l]) => (
                <div key={l}>
                  <div className="font-serif text-2xl text-primary-300">{v}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-gray-500">Scroll to explore</span>
          <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Amenities ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-3">World-Class Amenities</p>
          <h2 className="section-title">Everything You Need, <span className="gold-text">Perfectly Crafted</span></h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {AMENITIES.map(a => (
            <div key={a.label} className="card p-5 text-center hover:border-primary-800/50 transition-all duration-300 group">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{a.icon}</div>
              <h3 className="text-white text-sm font-semibold mb-1">{a.label}</h3>
              <p className="text-gray-600 text-xs leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Rooms ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-3">Our Collection</p>
            <h2 className="section-title">Featured <span className="gold-text">Rooms & Suites</span></h2>
          </div>
          <Link to="/rooms" className="btn-outline text-sm whitespace-nowrap self-start sm:self-auto">View All Rooms →</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(r => <RoomCard key={r._id} room={r} />)}
          </div>
        )}
        {!loading && rooms.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No rooms available. Please check back later.</p>
          </div>
        )}
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 bg-hotel-card border-y border-hotel-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-4">Why LuxeStay</p>
              <h2 className="section-title mb-6">Redefining the Art of <span className="gold-text">Luxury Hospitality</span></h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                For over two decades, LuxeStay has been synonymous with unparalleled luxury, personalized service, and creating memories that last a lifetime. Our philosophy is simple: your comfort is our masterpiece.
              </p>
              <div className="space-y-4">
                {[
                  ['Best Price Guarantee', 'We match any price — your stay, your value.'],
                  ['Instant Confirmation', 'Book in seconds, confirm instantly, relax immediately.'],
                  ['Free Cancellation', 'Plans change. Cancel up to 24hrs before, no charge.'],
                  ['24/7 Concierge', 'Our team is always on hand for every need, anytime.'],
                ].map(([title, desc]) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/rooms" className="btn-primary inline-block mt-8">Explore Our Rooms</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400" alt="" className="rounded-2xl object-cover h-48 w-full" onError={e => e.target.style.display='none'} />
              <img src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400" alt="" className="rounded-2xl object-cover h-48 w-full mt-6" onError={e => e.target.style.display='none'} />
              <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400" alt="" className="rounded-2xl object-cover h-48 w-full -mt-6" onError={e => e.target.style.display='none'} />
              <img src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400" alt="" className="rounded-2xl object-cover h-48 w-full" onError={e => e.target.style.display='none'} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-3">Guest Reviews</p>
          <h2 className="section-title">What Our <span className="gold-text">Guests Say</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="card p-6 hover:border-primary-800/40 transition-all duration-300">
              <div className="flex text-primary-400 mb-4">
                {'★'.repeat(t.rating)}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-gray-600 text-xs">{t.country} · {t.stay}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-12 border-primary-900/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-transparent" />
            <div className="relative z-10">
              <h2 className="section-title mb-4">Ready for an <span className="gold-text">Unforgettable Stay?</span></h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">Book your dream room today and experience luxury that goes beyond expectations.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/rooms" className="btn-primary px-8 py-4 text-base">Browse All Rooms</Link>
                <Link to="/register" className="btn-outline px-8 py-4 text-base">Create Free Account</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
