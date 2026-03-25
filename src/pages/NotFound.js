import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-hotel-dark">
      <div className="text-center">
        <div className="font-serif text-9xl text-primary-800/40 mb-4">404</div>
        <h1 className="font-serif text-3xl text-white mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary px-8 py-3">Go Home</Link>
          <Link to="/rooms" className="btn-outline px-8 py-3">Browse Rooms</Link>
        </div>
      </div>
    </div>
  );
}
