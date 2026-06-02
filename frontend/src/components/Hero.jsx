import React from 'react';

export const Hero = () => {
  return (
    <header className="relative w-full max-w-6xl mx-auto pt-20 pb-10 px-4 flex flex-col items-center overflow-hidden border-b border-brand-border/40">
      {/* Dynamic Cyber Grid Background */}
      <div className="absolute inset-0 -z-10 bg-grid-cyber [mask-image:radial-gradient(ellipse_60%_60%_at_50%_10%,#000_60%,transparent_100%)] opacity-40"></div>
      
      {/* Cybernetic Glowing Tech Blob Overlay */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-brand-cyan/10 rounded-full blur-[100px] -z-10 animate-cyber-pulse"></div>

      {/* Cyber Scanline Effect */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none opacity-20">
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-brand-cyan to-transparent animate-scanline"></div>
      </div>

      {/* Code Accent Bracket Tag */}
      <div className="flex items-center space-x-2 border border-brand-border bg-brand-dark px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-brand-cyan mb-6 animate-fade-in-up">
        <span className="text-brand-emerald">●</span>
        <span>SYS.STATUS: OPERATIONAL_v1.0</span>
      </div>

      {/* Ultra-Premium Brutalist Header */}
      <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-center max-w-4xl leading-[0.95] mb-6 animate-fade-in-up delay-100 uppercase select-none">
        DECODE THE <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-cyan to-brand-emerald">ALGORITHM.</span>
      </h1>

      {/* Center-Staggered Subtitle */}
      <p className="text-brand-muted text-base md:text-lg text-center max-w-xl font-mono leading-relaxed mb-8 animate-fade-in-up delay-200 uppercase tracking-tight">
        [ Engineering-grade resume fit evaluation using Claude 3.5 Sonnet to parse structure, keyword overlap & formatting anomalies. ]
      </p>

      {/* Premium Horizontal Split Accent Lines */}
      <div className="flex items-center space-x-4 w-full max-w-xs mb-4 animate-fade-in-up delay-300">
        <div className="h-[1px] flex-grow bg-brand-border/40"></div>
        <div className="h-[6px] w-[6px] bg-brand-cyan rotate-45"></div>
        <div className="h-[6px] w-[6px] bg-brand-emerald rotate-45"></div>
        <div className="h-[1px] flex-grow bg-brand-border/40"></div>
      </div>
    </header>
  );
};
