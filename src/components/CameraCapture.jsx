import React from 'react';

export default function CameraCapture({
  label,
  value,
  onChange,
  className = '',
}) {
  return (
    <div className={`bg-white/3 rounded-xl p-3 border border-white/5 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-300 text-xs">{label}</span>
        {value && (
          <button type="button" onClick={() => onChange?.('')} className="text-xs text-red-400 hover:text-red-300">
            Remove
          </button>
        )}
      </div>

      {value ? (
        <img src={value} alt={label} className="w-full h-32 object-cover rounded-lg border border-white/10" />
      ) : (
        <div className="w-full h-32 rounded-lg border border-dashed border-white/15 flex items-center justify-center text-gray-500 text-xs">
          No image
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <label className="flex-1 btn-ghost py-2 text-xs text-center cursor-pointer border border-white/10 rounded-xl">
          Upload
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result;
                if (typeof result === 'string') onChange?.(result);
              };
              reader.readAsDataURL(file);
            }}
          />
        </label>
      </div>
    </div>
  );
}

