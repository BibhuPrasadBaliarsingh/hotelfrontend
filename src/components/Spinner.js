import React from 'react';

export default function Spinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const spinner = (
    <div className={`${sizes[size]} border-2 border-white/10 border-t-primary-500 rounded-full animate-spin`} />
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-hotel-dark flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/10 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  return spinner;
}
