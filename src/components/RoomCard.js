import React from 'react';
import { Link } from 'react-router-dom';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'star-filled' : 'star-empty'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">({rating?.toFixed(1)})</span>
    </div>
  );
}

const TYPE_COLORS = {
  Single: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Double: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Deluxe: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  Suite: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

export default function RoomCard({ room }) {
  const imgSrc = room.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600';

  return (
    <div className="room-card card overflow-hidden group cursor-pointer">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={imgSrc}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge border ${TYPE_COLORS[room.type] || TYPE_COLORS.Single}`}>
            {room.type}
          </span>
        </div>
        {/* Availability */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 glass px-2.5 py-1 rounded-full">
          <div className={`w-1.5 h-1.5 rounded-full ${room.isAvailable ? 'dot-available' : 'dot-unavailable'}`} />
          <span className="text-xs text-white font-medium">{room.isAvailable ? 'Available' : 'Unavailable'}</span>
        </div>
        {/* Price overlay */}
        <div className="absolute bottom-3 left-3">
          <div className="price-badge px-3 py-1.5 rounded-xl">
            <span className="text-primary-300 font-bold text-lg">${room.price}</span>
            <span className="text-gray-400 text-xs">/night</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-white text-base mb-1 group-hover:text-primary-300 transition-colors line-clamp-1">{room.name}</h3>

        {room.rating > 0 && (
          <div className="mb-2">
            <StarRating rating={room.rating} />
          </div>
        )}

        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">{room.description}</p>

        {/* Specs */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-white/5">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {room.capacity} guests
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            {room.size} m²
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Floor {room.floor}
          </span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-4">
          {room.amenities?.slice(0, 3).map(a => (
            <span key={a} className="text-xs px-2 py-0.5 bg-white/5 rounded-md text-gray-400">{a}</span>
          ))}
          {room.amenities?.length > 3 && (
            <span className="text-xs px-2 py-0.5 bg-white/5 rounded-md text-gray-500">+{room.amenities.length - 3} more</span>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-2">
          <Link to={`/rooms/${room._id}`} className="flex-1 text-center btn-outline text-sm py-2.5">View Details</Link>
          {room.isAvailable && (
            <Link to={`/book/${room._id}`} className="flex-1 text-center btn-primary text-sm py-2.5">Book Now</Link>
          )}
        </div>
      </div>
    </div>
  );
}
