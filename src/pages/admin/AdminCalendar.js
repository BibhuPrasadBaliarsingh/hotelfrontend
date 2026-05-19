import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAllBookings } from '../../services/api';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatDateKey = (date) => date.toISOString().slice(0, 10);

const buildMonthGrid = (year, month) => {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const grid = [];
  for (let week = 0; week < 6; week += 1) {
    const row = [];
    for (let day = 0; day < 7; day += 1) {
      const cell = new Date(start);
      cell.setDate(start.getDate() + week * 7 + day);
      row.push(cell);
    }
    grid.push(row);
  }
  return grid;
};

export default function AdminCalendar() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  useEffect(() => {
    getAllBookings()
      .then((res) => setBookings(res.data.bookings || []))
      .catch(() => toast.error('Unable to load bookings for calendar'))
      .finally(() => setLoading(false));
  }, []);

  const futureBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .map((booking) => ({
        ...booking,
        checkInDate: new Date(booking.checkIn),
        checkOutDate: new Date(booking.checkOut),
      }))
      .filter((booking) => booking.status !== 'cancelled' && booking.checkOutDate >= now)
      .sort((a, b) => a.checkInDate - b.checkInDate);
  }, [bookings]);

  const calendar = useMemo(() => {
    const grid = buildMonthGrid(current.year, current.month);
    const map = {};

    futureBookings.forEach((booking) => {
      const start = new Date(booking.checkInDate);
      const end = new Date(booking.checkOutDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = formatDateKey(d);
        if (!map[key]) map[key] = [];
        map[key].push(booking);
      }
    });

    return grid.map((week) => week.map((date) => ({ date, bookings: map[formatDateKey(date)] || [] })));
  }, [current, futureBookings]);

  const monthLabel = `${MONTHS[current.month]} ${current.year}`;
  const futureCount = futureBookings.length;
  const upcomingCount = futureBookings.filter((booking) => booking.checkInDate >= new Date()).length;

  return (
    <AdminLayout title="Future Booking Calendar" subtitle="Review upcoming reservations in a calendar-style view">
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card p-5 border border-white/10">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Future bookings</p>
              <p className="text-3xl font-semibold text-white">{futureCount}</p>
              <p className="text-gray-400 text-sm mt-2">Total reservations with upcoming stay dates.</p>
            </div>
            <div className="card p-5 border border-white/10">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Upcoming arrivals</p>
              <p className="text-3xl font-semibold text-white">{upcomingCount}</p>
              <p className="text-gray-400 text-sm mt-2">Bookings starting from today onward.</p>
            </div>
            <div className="card p-5 border border-white/10">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Month view</p>
              <p className="text-3xl font-semibold text-white">{monthLabel}</p>
              <p className="text-gray-400 text-sm mt-2">Navigate between months to inspect future stays.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-white font-semibold text-xl">Booking Calendar</h2>
              <p className="text-gray-400 text-sm">Hover or scan each day to see rooms scheduled for arrival and checkout.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrent((prev) => ({ year: prev.month === 0 ? prev.year - 1 : prev.year, month: prev.month === 0 ? 11 : prev.month - 1 }))}
                className="btn-outline py-2 px-3 text-sm">Previous</button>
              <button onClick={() => setCurrent((prev) => ({ year: prev.month === 11 ? prev.year + 1 : prev.year, month: prev.month === 11 ? 0 : prev.month + 1 }))}
                className="btn-outline py-2 px-3 text-sm">Next</button>
            </div>
          </div>

          <div className="bg-hotel-card border border-hotel-border rounded-3xl p-4 overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">
              {WEEKDAYS.map((day) => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendar.flat().map(({ date, bookings: dayBookings }, index) => {
                const isCurrentMonth = date.getMonth() === current.month;
                const isToday = formatDateKey(date) === formatDateKey(new Date());
                return (
                  <div key={index}
                    className={`min-h-[130px] rounded-3xl border p-3 text-left ${isCurrentMonth ? 'border-white/10 bg-white/5' : 'border-transparent bg-white/5 opacity-40'} ${isToday ? 'ring-1 ring-primary-500 ring-offset-2 ring-offset-hotel-dark' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>{date.getDate()}</span>
                      {dayBookings.length > 0 && (
                        <span className="rounded-full bg-primary-500/10 text-primary-300 text-[10px] px-2 py-1">{dayBookings.length}</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayBookings.slice(0, 2).map((booking) => (
                        <div key={booking._id} className="rounded-2xl bg-white/5 p-2 text-[11px] text-gray-300">
                          <div className="font-semibold truncate">{booking.bookingRef || 'REF'}</div>
                          <div className="truncate text-gray-500">{booking.room?.name || 'Room'}</div>
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-[10px] text-primary-300">+{dayBookings.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-6 border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-4">Next 10 Upcoming Bookings</h3>
            <div className="space-y-3">
              {futureBookings.slice(0, 10).map((booking) => (
                <div key={booking._id} className="rounded-3xl border border-white/10 p-4 bg-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-[0.18em] mb-2">{booking.bookingRef}</p>
                      <p className="text-white font-semibold truncate">{booking.guestInfo?.name || booking.user?.name || 'Guest'}</p>
                      <p className="text-gray-500 text-xs truncate max-w-[460px]">{booking.room?.name || 'Room'} · {booking.room?.type || 'Type'}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-400">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                      <p className="text-white font-semibold">→</p>
                      <p className="text-gray-400">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
