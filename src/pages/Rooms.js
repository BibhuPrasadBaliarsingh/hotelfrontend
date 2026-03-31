import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRooms } from '../services/api';
import RoomCard from '../components/RoomCard';
import Spinner from '../components/Spinner';

const TYPES = ['Single', 'Double', 'Deluxe', 'Suite'];

export default function Rooms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    available: searchParams.get('available') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
  });
  const [sortBy, setSortBy] = useState('default');
  const [view, setView] = useState('grid');

  const today = new Date().toISOString().split('T')[0];

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await getRooms(params);
      setRooms(res.data.rooms);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const clearFilters = () => {
    setFilters({ type: '', minPrice: '', maxPrice: '', available: '', checkIn: '', checkOut: '' });
    setSearchParams({});
  };

  const sorted = [...rooms].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-hotel-card border-b border-hotel-border px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <p className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-2">Our Collection</p>
          <h1 className="font-serif text-3xl md:text-4xl text-white">Rooms & Suites</h1>
          <p className="text-gray-500 mt-2 text-sm">{rooms.length} rooms found{activeFilterCount > 0 ? ` · ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied` : ''}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-white font-semibold">Filters</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">Clear all</button>
                )}
              </div>

              {/* Dates */}
              <div className="mb-5">
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3 block">Date Range</label>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Check In</p>
                    <input type="date" min={today} value={filters.checkIn} onChange={e => setFilter('checkIn', e.target.value)} className="input-field text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Check Out</p>
                    <input type="date" min={filters.checkIn || today} value={filters.checkOut} onChange={e => setFilter('checkOut', e.target.value)} className="input-field text-sm" />
                  </div>
                </div>
              </div>

              {/* Room Type */}
              <div className="mb-5">
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3 block">Room Type</label>
                <div className="space-y-2">
                  <button onClick={() => setFilter('type', '')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.type ? 'bg-primary-900/30 text-primary-300 border border-primary-800/40' : 'text-gray-400 hover:bg-white/5'}`}>All Types</button>
                  {TYPES.map(t => (
                    <button key={t} onClick={() => setFilter('type', filters.type === t ? '' : t)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.type === t ? 'bg-primary-900/30 text-primary-300 border border-primary-800/40' : 'text-gray-400 hover:bg-white/5'}`}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3 block">Price per Night</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Min ₹</p>
                    <input type="number" placeholder="0" value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)} className="input-field text-sm" min="0" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Max ₹</p>
                    <input type="number" placeholder="999" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)} className="input-field text-sm" min="0" />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3 block">Availability</label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${filters.available === 'true' ? 'bg-primary-600' : 'bg-white/10'}`}
                    onClick={() => setFilter('available', filters.available === 'true' ? '' : 'true')}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${filters.available === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-gray-300">Available only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Room Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <p className="text-gray-500 text-sm">{sorted.length} room{sorted.length !== 1 ? 's' : ''} available</p>
              <div className="flex items-center gap-3">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field text-sm py-2 w-auto">
                  <option value="default">Default Order</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <div className="flex border border-white/10 rounded-lg overflow-hidden">
                  <button onClick={() => setView('grid')} className={`p-2 transition-colors ${view === 'grid' ? 'bg-primary-900/40 text-primary-400' : 'text-gray-500 hover:text-white'}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </button>
                  <button onClick={() => setView('list')} className={`p-2 transition-colors ${view === 'list' ? 'bg-primary-900/40 text-primary-400' : 'text-gray-500 hover:text-white'}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🏨</div>
                <h3 className="text-white font-semibold text-lg mb-2">No Rooms Found</h3>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your filters to see more results.</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {sorted.map(r => <RoomCard key={r._id} room={r} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
