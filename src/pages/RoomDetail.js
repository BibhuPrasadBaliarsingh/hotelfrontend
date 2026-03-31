import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRoom, addReview } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';

export default function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getRoom(id).then(res => setRoom(res.data.room)).catch(() => toast.error('Room not found')).finally(() => setLoading(false));
  }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to leave a review'); navigate('/login'); return; }
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return; }
    setSubmitting(true);
    try {
      await addReview(id, reviewForm);
      toast.success('Review added successfully!');
      const res = await getRoom(id); setRoom(res.data.room);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Spinner size="lg" /></div>;
  if (!room) return <div className="min-h-screen flex items-center justify-center pt-20"><p className="text-gray-500">Room not found</p></div>;

  const imgs = room.images?.length ? room.images : ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'];

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/rooms" className="hover:text-primary-400 transition-colors">Rooms</Link>
          <span>/</span>
          <span className="text-gray-300">{room.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden h-72 sm:h-96">
                <img src={imgs[activeImg]} alt={room.name} className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'; }} />
              </div>
              {imgs.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {imgs.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)} className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200'; }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Room Info */}
            <div className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge bg-primary-900/30 text-primary-400 border border-primary-800/40">{room.type}</span>
                    <div className={`w-2 h-2 rounded-full ${room.isAvailable ? 'dot-available' : 'dot-unavailable'}`} />
                    <span className={`text-xs font-medium ${room.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                      {room.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl text-white">{room.name}</h1>
                  {room.rating > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex text-primary-400">{'★'.repeat(Math.round(room.rating))}</div>
                      <span className="text-white font-medium text-sm">{room.rating}</span>
                      <span className="text-gray-500 text-xs">({room.totalReviews} reviews)</span>
                    </div>
                  )}
                </div>
                <div className="price-badge px-5 py-3 rounded-2xl text-right">
                  <div className="text-3xl font-bold text-primary-300">{formatINR(room.price)}</div>
                  <div className="text-gray-500 text-xs">per night</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">{room.description}</p>

              {/* Specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/5">
                {[
                  ['👥', `${room.capacity} Guests`, 'Capacity'],
                  ['📐', `${room.size} m²`, 'Room Size'],
                  ['🏢', `Floor ${room.floor}`, 'Location'],
                  ['🌟', `${room.totalReviews} Reviews`, 'Reviews'],
                ].map(([icon, val, label]) => (
                  <div key={label} className="bg-white/3 rounded-xl p-3 text-center">
                    <div className="text-xl mb-1">{icon}</div>
                    <div className="text-white text-sm font-semibold">{val}</div>
                    <div className="text-gray-600 text-xs">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="card p-6">
              <h3 className="text-white font-semibold mb-4">Room Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {room.amenities?.map(a => (
                  <div key={a} className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <h3 className="text-white font-semibold mb-5">Guest Reviews ({room.totalReviews})</h3>

              {/* Add Review */}
              {isAuthenticated && user?.role !== 'admin' && (
                <form onSubmit={handleReview} className="bg-white/3 rounded-xl p-4 mb-6">
                  <p className="text-sm text-white font-medium mb-3">Write a Review</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500">Rating:</span>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewForm(f => ({...f, rating: s}))}
                        className={`text-xl transition-transform hover:scale-110 ${s <= reviewForm.rating ? 'star-filled' : 'star-empty'}`}>★</button>
                    ))}
                  </div>
                  <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))}
                    placeholder="Share your experience..." rows={3} className="input-field text-sm resize-none mb-3" />
                  <button type="submit" disabled={submitting} className="btn-primary text-sm py-2 px-5">{submitting ? 'Posting...' : 'Post Review'}</button>
                </form>
              )}

              <div className="space-y-4">
                {room.reviews?.length === 0 ? (
                  <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
                ) : room.reviews?.map((r, i) => (
                  <div key={i} className="border-b border-white/5 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-900/40 flex items-center justify-center text-primary-400 text-sm font-bold">
                          {r.userName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{r.userName}</p>
                          <p className="text-gray-600 text-xs">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex text-primary-400 text-sm">{'★'.repeat(r.rating)}</div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Panel */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary-300">{formatINR(room.price)}</div>
                <div className="text-gray-500 text-sm">per night</div>
              </div>
              <div className="space-y-3 mb-6 text-sm">
                {[
                  ['Room Type', room.type],
                  ['Capacity', `Up to ${room.capacity} guests`],
                  ['Size', `${room.size} m²`],
                  ['Floor', `Floor ${room.floor}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>
              {room.isAvailable ? (
                <Link to={isAuthenticated ? `/book/${room._id}` : '/login'} className="btn-primary w-full text-center block py-3.5 text-base">
                  {isAuthenticated ? 'Book This Room' : 'Login to Book'}
                </Link>
              ) : (
                <div className="w-full text-center py-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                  Currently Unavailable
                </div>
              )}
              {!isAuthenticated && (
                <p className="text-center text-xs text-gray-600 mt-3">
                  <Link to="/register" className="text-primary-400 hover:underline">Create a free account</Link> to book rooms
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-600 text-center">
                ✓ Free cancellation up to 24h before<br/>✓ Instant booking confirmation<br/>✓ Best price guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
