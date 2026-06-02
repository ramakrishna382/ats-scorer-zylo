import React, { useState } from 'react';

export const JobDescriptionInput = ({ value, onChange, limit }) => {
  const [focused, setFocused] = useState(false);
  const charCount = value.length;
  const fillPercentage = Math.min((charCount / limit) * 100, 100);

  // Dynamic progress line coloring
  const getProgressColor = () => {
    if (charCount > limit - 200) return 'bg-brand-rose';
    if (charCount > limit - 800) return 'bg-brand-amber';
    return 'bg-brand-cyan';
  };

  return (
    <div className={`w-full bg-brand-card border p-6 transition-spring duration-300 relative rounded-xl ${focused ? 'border-brand-cyan/80 shadow-[0_0_24px_rgba(6,182,212,0.06)]' : 'border-brand-border/60'}`}>
      
      <div className="flex justify-between items-center mb-4">
        <label htmlFor="jd-input-textarea" className="text-sm font-bold tracking-tight text-brand-text flex items-center cursor-pointer">
          <span className="text-brand-cyan mr-2">📋</span> Target Job Description
        </label>
        <span className="text-xs font-mono text-brand-muted">
          Characters: <span className={charCount > limit - 200 ? 'text-brand-rose font-bold' : 'text-brand-cyan'}>{charCount}</span> / {limit}
        </span>
      </div>

      <textarea
        id="jd-input-textarea"
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the target job description or role requirements here..."
        className="w-full h-72 bg-[#020617] border border-brand-border/60 p-4 text-sm text-brand-text placeholder-brand-muted/50 focus:outline-none focus:border-brand-cyan/80 resize-none transition-colors duration-200 rounded-lg"
        maxLength={limit}
      />

      {/* Character count progress bar */}
      <div className="w-full bg-slate-900 h-1 mt-4 relative overflow-hidden rounded-full">
        <div 
          className={`h-full ${getProgressColor()} transition-all duration-300 rounded-full`} 
          style={{ width: `${fillPercentage}%` }}
        ></div>
      </div>

      <div className="mt-3 flex justify-between items-center text-xs tracking-wide">
        <span className="text-brand-muted font-medium">Status: {charCount > 0 ? <span className="text-brand-emerald font-semibold">Loaded</span> : <span className="text-brand-muted">Awaiting Input</span>}</span>
        
        {charCount >= limit ? (
          <span className="text-brand-rose font-semibold animate-pulse">
            Max limit reached
          </span>
        ) : charCount > limit - 200 ? (
          <span className="text-brand-amber font-semibold">
            Approaching limit
          </span>
        ) : (
          <span className="text-brand-muted font-mono text-[10px]">UTF-8</span>
        )}
      </div>
    </div>
  );
};
