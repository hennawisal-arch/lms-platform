import React, { useRef } from 'react';
import { API_ORIGIN } from '../api/axios';

export default function VideoPlayer({ filename, onTimeUpdate, onEnded }) {
  const videoRef = useRef(null);
  const lastReported = useRef(0);

  if (!filename) {
    return (
      <div className="aspect-video bg-ink-800 rounded-lg flex items-center justify-center text-slate-500">
        No video uploaded for this lesson yet
      </div>
    );
  }

  const token = localStorage.getItem('lms_token');
  const src = `${API_ORIGIN}/api/videos/stream/${filename}?token=${token}`;

  const handleTimeUpdate = (e) => {
    const current = Math.floor(e.target.currentTime);
    // Throttle progress reports to roughly once every 5 seconds of playback
    if (current - lastReported.current >= 5) {
      lastReported.current = current;
      onTimeUpdate?.(current);
    }
  };

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      className="w-full aspect-video rounded-lg bg-black"
      onTimeUpdate={handleTimeUpdate}
      onEnded={() => onEnded?.()}
    />
  );
}