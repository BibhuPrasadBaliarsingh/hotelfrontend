import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { getRooms } from '../../services/api';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

const statusConfig = {
  available: {
    label: 'Available',
    card: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-50 hover:border-emerald-400/40 hover:bg-emerald-500/10',
    badge: 'bg-emerald-400/10 text-emerald-300 border border-emerald-500/20',
  },
  booked: {
    label: 'Booked',
    card: 'bg-slate-900 border-slate-700 text-slate-400 cursor-not-allowed opacity-70',
    badge: 'bg-slate-700 text-slate-300 border border-slate-600',
  },
  pending: {
    label: 'Pending',
    card: 'bg-amber-500/10 border-amber-500/25 text-amber-100 hover:border-amber-400/40 hover:bg-amber-500/10',
    badge: 'bg-amber-400/10 text-amber-300 border border-amber-500/20',
  },
};

const getRoomStatus = (room) => {
  if (room.status === 'pending') return 'pending';
  return room.isAvailable ? 'available' : 'booked';
};

const formatRoomNumber = (room, index) => {
  if (room.roomNumber !== undefined && room.roomNumber !== null) return String(room.roomNumber);
  const matched = String(room.name || '').match(/(\d{2,})/);
  if (matched) return matched[1];
  if (room.floor || room.floor === 0) {
    return `${room.floor}${String(index + 1).padStart(2, '0')}`;
  }
  return room.name || 'Room';
};

export default function RoomAvailability() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await getRooms();
        if (!active) return;
        setRooms(res.data.rooms || []);
      } catch (err) {
        toast.error('Failed to load rooms');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchRooms();
    return () => { active = false; };
  }, []);

  const groupedByFloor = useMemo(() => {
    const sortedRooms = [...rooms].sort((a, b) => {
      const floorA = a.floor ?? 0;
      const floorB = b.floor ?? 0;
      if (floorA !== floorB) return floorA - floorB;
      const numA = a.roomNumber ?? Number(String(a.name || '').match(/(\d{2,})/)?.[1] || 0);
      const numB = b.roomNumber ?? Number(String(b.name || '').match(/(\d{2,})/)?.[1] || 0);
      return numA - numB;
    });
    return sortedRooms.reduce((acc, room, index) => {
      const floor = room.floor ?? 0;
      const floorKey = `Floor ${floor}`;
      acc[floorKey] = acc[floorKey] || [];
      acc[floorKey].push({
        ...room,
        displayNumber: formatRoomNumber(room, index),
      });
      return acc;
    }, {});
  }, [rooms]);

  const floorKeys = useMemo(() => Object.keys(groupedByFloor), [groupedByFloor]);

  return (
    <AdminLayout title="Room Availability" subtitle="Live hotel room availability by floor">
      <div className="space-y-6">
        <section className="card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-white text-2xl font-semibold">Availability Grid</h2>
              <p className="text-gray-400 text-sm max-w-2xl">See rooms grouped by floor with live status from your backend. Click any available room to start booking.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              {['available', 'booked', 'pending'].map((key) => {
                const config = statusConfig[key];
                return (
                  <div key={key} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-gray-200">
                    <span className={`w-2.5 h-2.5 rounded-full ${key === 'available' ? 'bg-emerald-400' : key === 'booked' ? 'bg-slate-400' : 'bg-amber-300'}`} />
                    <span>{config.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="card p-10 flex justify-center"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-8">
            {floorKeys.length === 0 ? (
              <div className="card p-10 text-center text-gray-400">No rooms are available in the current inventory.</div>
            ) : (
              floorKeys.map((floor) => (
                <div key={floor} className="space-y-4">
                  <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
                    <div className="hidden md:flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-8 px-4 text-sm font-semibold text-gray-300 uppercase tracking-[0.24em]">
                      {floor}
                    </div>
                    <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 min-w-[680px]">
                        {groupedByFloor[floor].map((room) => {
                          const status = getRoomStatus(room);
                          const config = statusConfig[status];
                          return (
                            <button
                              key={room._id}
                              type="button"
                              disabled={status === 'booked'}
                              title={`Room ${room.displayNumber} · ${room.type} · ${formatINR(room.price)}`}
                              onClick={() => navigate(`/book/${room._id}`, { state: { room } })}
                              className={`group flex flex-col items-start gap-3 rounded-3xl border p-4 text-left transition-all duration-200 ${config.card} ${status === 'booked' ? 'cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(16,185,129,0.16)]'} `}
                            >
                              <div className="flex items-center justify-between w-full gap-2">
                                <span className="text-xl font-semibold tracking-tight text-white">{room.displayNumber}</span>
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.badge}`}>{config.label}</span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs uppercase tracking-[0.24em] text-gray-400">{room.type}</p>
                                <p className="text-base font-semibold text-white">{formatINR(room.price)}</p>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">{room.capacity ? `${room.capacity} guests` : 'Capacity unknown'}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
