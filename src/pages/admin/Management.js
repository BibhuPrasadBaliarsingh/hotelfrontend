import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getDashboardStats, exportRevenueReport } from '../../services/api';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

export default function AdminManagement() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const monthPadded = String(exportMonth).padStart(2, '0');
      const res = await exportRevenueReport({ year: exportYear, month: monthPadded });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `revenue-${exportYear}-${monthPadded}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Revenue report exported');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => toast.error('Failed to load management metrics'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Management Corner" subtitle="Revenue, occupancy and performance KPIs for leadership">
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card bg-gradient-to-br from-primary-900/30 to-primary-900/5 border-primary-800/30 text-primary-400">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Revenue</p>
              <p className="text-3xl font-semibold">{formatINR(stats?.revenue)}</p>
              <p className="text-gray-500 text-xs mt-2">All confirmed bookings</p>
            </div>
            <div className="stat-card bg-gradient-to-br from-green-900/30 to-green-900/5 border-green-800/30 text-green-400">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Active Bookings</p>
              <p className="text-3xl font-semibold">{stats?.active}</p>
              <p className="text-gray-500 text-xs mt-2">Checked-in and upcoming</p>
            </div>
            <div className="stat-card bg-gradient-to-br from-yellow-900/30 to-yellow-900/5 border-yellow-800/30 text-yellow-400">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Cancelled</p>
              <p className="text-3xl font-semibold">{stats?.cancelled}</p>
              <p className="text-gray-500 text-xs mt-2">Booking interruptions</p>
            </div>
          </div>

          <div className="card p-6 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-white font-semibold text-xl">Export Monthly Revenue</h2>
                <p className="text-gray-400 text-sm">Download a full booking revenue report for the selected year and month.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-[0.18em] mb-1 block">Year</label>
                  <select value={exportYear} onChange={(e) => setExportYear(Number(e.target.value))} className="input-field text-sm">
                    {[exportYear - 1, exportYear, exportYear + 1].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-[0.18em] mb-1 block">Month</label>
                  <select value={exportMonth} onChange={(e) => setExportMonth(Number(e.target.value))} className="input-field text-sm">
                    {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                      <option key={month} value={month}>{month.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleExport} disabled={exporting}
                  className="btn-primary py-2.5 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {exporting ? 'Exporting…' : 'Download XLSX'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-white font-semibold text-xl mb-3">Monthly revenue</h2>
              <div className="grid gap-3">
                {(stats?.monthly || []).map((month) => (
                  <div key={month.month} className="glass p-4 rounded-3xl border border-white/10 flex items-center justify-between">
                    <span className="text-gray-400">{month.month}</span>
                    <span className="text-white font-semibold">{formatINR(month.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <h2 className="text-white font-semibold text-xl mb-3">Performance metrics</h2>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex justify-between"><span>Total rooms</span><span className="text-white">{stats?.totalRooms}</span></div>
                <div className="flex justify-between"><span>Total bookings</span><span className="text-white">{stats?.totalBookings}</span></div>
                <div className="flex justify-between"><span>Registered users</span><span className="text-white">{stats?.totalUsers}</span></div>
                <div className="flex justify-between"><span>Avg revenue / booking</span><span className="text-white">{stats?.totalBookings ? formatINR(Math.round(stats.revenue / stats.totalBookings)) : formatINR(0)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
