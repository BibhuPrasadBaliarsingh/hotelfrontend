import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/admin/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/admin/rooms',     icon: '🛏',  label: 'Rooms' },
  { to: '/admin/bookings',  icon: '📋', label: 'Bookings' },
  { to: '/admin/users',     icon: '👥',  label: 'Users' },
];

export default function AdminLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = ({ mobile = false }) => (
    <div className={`${mobile ? 'w-64' : 'w-64'} bg-hotel-card border-r border-hotel-border flex flex-col h-full`}>
      {/* Logo */}
      <div className="p-6 border-b border-hotel-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-serif font-bold text-sm">L</span>
          </div>
          <div>
            <div className="font-serif text-white text-lg leading-none">LuxeStay</div>
            <div className="text-primary-400 text-xs">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(n => {
          const active = location.pathname === n.to;
          return (
            <Link key={n.to} to={n.to}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${active ? 'active bg-primary-900/30 text-primary-400' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
              <span className="text-base">{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-hotel-border">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-gray-600 text-xs">Administrator</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="flex-1 text-center text-xs py-2 px-3 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
            ← Site
          </Link>
          <button onClick={handleLogout} className="flex-1 text-xs py-2 px-3 rounded-lg text-red-400 hover:bg-red-500/5 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-hotel-dark overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full z-50 md:hidden flex flex-col shadow-2xl">
            <Sidebar mobile />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-hotel-card border-b border-hotel-border px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="font-serif text-xl text-white">{title}</h1>
                {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-white text-sm font-medium">{user?.name}</p>
                <p className="text-gray-600 text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white font-bold text-sm ml-2">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
