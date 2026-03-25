import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/rooms', label: 'Rooms' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-hotel-dark/95 backdrop-blur-md border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/50">
              <span className="text-white font-serif font-bold text-sm">L</span>
            </div>
            <span className="font-serif text-xl text-white group-hover:text-primary-300 transition-colors">
              LuxeStay
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(l.to) ? 'text-primary-400 bg-primary-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                {l.label}
              </Link>
            ))}
            {isAuthenticated && user?.role !== 'admin' && (
              <Link to="/my-bookings"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/my-bookings') ? 'text-primary-400 bg-primary-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                My Bookings
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium text-primary-400 bg-primary-900/20 hover:bg-primary-900/30 transition-all duration-200">
                Admin Panel
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 glass px-3 py-2 rounded-xl hover:bg-white/10 transition-all duration-200">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white font-medium max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-48 card shadow-2xl shadow-black/50 py-1 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                    </div>
                    {user?.role !== 'admin' && (
                      <>
                        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          Profile
                        </Link>
                        <Link to="/my-bookings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          My Bookings
                        </Link>
                      </>
                    )}
                    <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2.5">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-hotel-dark/98 backdrop-blur-md border-t border-white/5 px-4 py-4 space-y-1 animate-fade-in">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive(l.to) ? 'text-primary-400 bg-primary-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{l.label}</Link>
          ))}
          {isAuthenticated ? (
            <>
              {user?.role !== 'admin' && <Link to="/my-bookings" className="block px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5">My Bookings</Link>}
              {user?.role !== 'admin' && <Link to="/profile" className="block px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5">Profile</Link>}
              {user?.role === 'admin' && <Link to="/admin/dashboard" className="block px-4 py-3 rounded-xl text-sm text-primary-400 bg-primary-900/20">Admin Panel</Link>}
              <button onClick={logout} className="block w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/5">Sign Out</button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center btn-outline py-2.5 text-sm">Sign In</Link>
              <Link to="/register" className="flex-1 text-center btn-primary py-2.5 text-sm">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
