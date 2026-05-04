import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const downscaleToJpegDataUrl = async (videoEl, { maxWidth = 960, maxHeight = 720, quality = 0.6 } = {}) => {
  const vw = videoEl.videoWidth || 0;
  const vh = videoEl.videoHeight || 0;
  if (!vw || !vh) return '';

  const scale = Math.min(maxWidth / vw, maxHeight / vh, 1);
  const w = Math.round(vw * scale);
  const h = Math.round(vh * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, w, h);

  return canvas.toDataURL('image/jpeg', clamp(quality, 0.2, 0.9));
};

const isMobileDevice = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export default function CameraCapture({
  label,
  value,
  onChange,
  defaultFacing = 'environment',
  className = '',
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [facing, setFacing] = useState(defaultFacing);
  const [error, setError] = useState('');

  const canCapture = useMemo(() => running && videoReady && !!videoRef.current, [running, videoReady]);

  useEffect(() => {
    const preferredFacing = defaultFacing !== 'environment'
      ? defaultFacing
      : isMobileDevice() ? 'environment' : 'user';
    setFacing(preferredFacing);
  }, [defaultFacing]);

  useEffect(() => () => stop(), []);

  const stop = () => {
    try {
      streamRef.current?.getTracks?.().forEach((track) => track.stop());
    } catch {
      // ignore
    }
    streamRef.current = null;
    setRunning(false);
    setVideoReady(false);
    setError('');
  };

  const waitForVideoReady = (video) => new Promise((resolve) => {
    if (!video) return resolve(false);
    if (video.videoWidth > 0 && video.videoHeight > 0) return resolve(true);

    const onReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        cleanup();
        resolve(true);
      }
    };

    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onReady);
      video.removeEventListener('canplay', onReady);
      clearTimeout(timeout);
    };

    video.addEventListener('loadedmetadata', onReady);
    video.addEventListener('canplay', onReady);
    const timeout = setTimeout(() => {
      cleanup();
      resolve(video.videoWidth > 0 && video.videoHeight > 0);
    }, 1200);
  });

  const handleVideoReady = async () => {
    if (videoRef.current) {
      const ready = await waitForVideoReady(videoRef.current);
      setVideoReady(ready);
    }
  };

  const start = async (overrideFacing) => {
    const targetFacing = overrideFacing || facing;
    stop();
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: targetFacing } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        setVideoReady(false);
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        await handleVideoReady();
      }
      setFacing(targetFacing);
      setRunning(true);
    } catch (e) {
      stop();
      const message = e?.message || 'Camera permission denied';
      setError(message);
      toast.error(message);
    }
  };

  const capture = async () => {
    if (!videoRef.current || !videoReady) {
      toast.error('Camera is not ready yet');
      return;
    }
    const dataUrl = await downscaleToJpegDataUrl(videoRef.current, {
      maxWidth: 900,
      maxHeight: 700,
      quality: 0.6,
    });
    if (!dataUrl) {
      toast.error('Failed to capture image');
      return;
    }
    onChange?.(dataUrl);
    stop();
  };

  const toggleFacing = async () => {
    const nextFacing = facing === 'environment' ? 'user' : 'environment';
    if (running) {
      await start(nextFacing);
    } else {
      setFacing(nextFacing);
    }
  };

  return (
    <div className={`bg-white/3 rounded-xl p-3 border border-white/5 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-300 text-xs">{label}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFacing}
            className="text-xs text-gray-400 hover:text-white"
            title="Switch camera"
          >
            {facing === 'environment' ? 'Back Cam' : 'Front Cam'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange?.('')} className="text-xs text-red-400 hover:text-red-300">
              Remove
            </button>
          )}
        </div>
      </div>

      {value ? (
        <img src={value} alt={label} className="w-full h-32 object-cover rounded-lg border border-white/10" />
      ) : (
        <div className="w-full h-32 rounded-lg border border-dashed border-white/15 flex items-center justify-center text-gray-500 text-xs">
          No image
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {!running ? (
          <button type="button" onClick={() => start()} className="flex-1 btn-outline py-2 text-xs">
            Open Camera
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={capture}
              disabled={!canCapture}
              title={!videoReady ? 'Waiting for camera to warm up' : 'Capture image'}
              className="flex-1 btn-primary py-2 text-xs disabled:opacity-50"
            >
              {videoReady ? 'Capture' : 'Loading...'}
            </button>
            <button type="button" onClick={stop} className="flex-1 btn-outline py-2 text-xs">
              Close
            </button>
          </>
        )}
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

      {error && <div className="mt-2 text-red-300 text-xs">{error}</div>}
      {running && !videoReady && (
        <div className="mt-2 text-yellow-300 text-xs">Camera is starting... please wait before capture.</div>
      )}

      {running && (
        <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
          <video
            ref={videoRef}
            playsInline
            muted
            onLoadedMetadata={handleVideoReady}
            onCanPlay={handleVideoReady}
            className="w-full h-44 object-cover bg-black"
          />
        </div>
      )}
    </div>
  );
}

