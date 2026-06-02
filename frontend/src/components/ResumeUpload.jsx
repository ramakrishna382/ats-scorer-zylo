import React, { useState } from 'react';

export const ResumeUpload = ({ value, onChange, limit }) => {
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
    <div className={`w-full bg-brand-card border p-6 transition-spring duration-300 relative ${focused ? 'border-brand-cyan shadow-[0_0_20px_rgba(6,182,212,0.08)]' : 'border-brand-border/80'}`}>
      
      {/* Absolute Geometric Visual Node */}
      <div className={`absolute top-[-1px] left-8 h-[2px] w-12 transition-colors duration-300 ${focused ? 'bg-brand-cyan' : 'bg-brand-border/40'}`}></div>

      <div className="flex justify-between items-center mb-4">
        <label htmlFor="resume-input-textarea" className="text-xs uppercase font-mono tracking-wider font-semibold text-brand-text flex items-center cursor-pointer">
          <span className="text-brand-cyan mr-2">SYS.INPUT.02 //</span> RESUME DATA
        </label>
        <span className="text-xs font-mono text-brand-muted">
          LEN: <span className={charCount > limit - 200 ? 'text-brand-rose font-bold' : 'text-brand-cyan'}>{charCount}</span> / {limit}
        </span>
      </div>

      <textarea
        id="resume-input-textarea"
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your plain text resume details (Summary, Experience, Skills, Education) here..."
        className="w-full h-72 bg-[#020617] border border-brand-border/60 p-4 text-sm font-mono text-brand-text placeholder-brand-muted/70 focus:outline-none focus:border-brand-cyan resize-none transition-colors duration-200"
        maxLength={limit}
      />

      {/* Interactive Cyber Character Progress Bar */}
      <div className="w-full bg-slate-900 h-[2px] mt-4 relative overflow-hidden">
        <div 
          className={`h-full ${getProgressColor()} transition-all duration-300`} 
          style={{ width: `${fillPercentage}%` }}
        ></div>
      </div>

      <div className="mt-3 flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
        <span className="text-brand-muted">STATUS: {charCount > 0 ? 'LOADED' : 'AWAITING_INPUT'}</span>
        
        {charCount >= limit ? (
          <span className="text-brand-rose font-semibold animate-pulse">
            [ MAX_LIMIT_REACHED ]
          </span>
        ) : charCount > limit - 200 ? (
          <span className="text-brand-amber font-semibold">
            [ APPROACHING_MAX ]
          </span>
        ) : (
          <span className="text-brand-muted">UTF-8 COMPLIANT</span>
        )}
      </div>
    </div>
  );
};
