import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-hotel-dark px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-700/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/20 backdrop-blur sm:p-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.45em] text-primary-400">
            Lost In The Lobby
          </p>

          <div className="mb-6 font-serif text-7xl text-primary-500/80 sm:text-8xl md:text-9xl">
            404
          </div>

          <h1 className="mx-auto max-w-2xl font-serif text-3xl text-white sm:text-4xl md:text-5xl">
            The page you requested is not available.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-300 sm:text-lg">
            The link may be broken, the page may have moved, or the address might be incorrect.
            You can return to the homepage or continue browsing available rooms.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/" className="btn-primary min-w-[180px] px-8 py-3">
              Back To Home
            </Link>
            <Link to="/rooms" className="btn-outline min-w-[180px] px-8 py-3">
              View Rooms
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
