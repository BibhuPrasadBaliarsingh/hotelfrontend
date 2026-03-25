import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-hotel-card border-t border-hotel-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-serif font-bold text-sm">L</span>
              </div>
              <span className="font-serif text-xl text-white">LuxeStay</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Experience the pinnacle of luxury hospitality. Where every stay becomes an unforgettable memory.
            </p>
            <div className="flex gap-3 mt-5">
              {['Facebook', 'Twitter', 'Instagram'].map(s => (
                <div key={s} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-900/30 hover:border-primary-700 transition-all cursor-pointer">
                  <span className="text-xs text-gray-400">{s[0]}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/rooms', 'Our Rooms'], ['/my-bookings', 'My Bookings']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-gray-500 hover:text-primary-400 text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>📍 123 Luxury Ave, City</li>
              <li>📞 +1 800-LUXE-STAY</li>
              <li>✉️ hello@luxestay.com</li>
              <li>🕐 24/7 Guest Support</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} LuxeStay. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-gray-600">
            <span className="hover:text-gray-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
