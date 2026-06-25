import React from 'react';

export default function ProgressBar({ percent = 0, showLabel = true }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div>
      <div className="h-2 w-full rounded-full bg-ink-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-500 to-mint-400 transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <p className="text-xs text-slate-400 mt-1">{clamped}% complete</p>}
    </div>
  );
}
