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

      {/* Premium Badge Status */}
      <div className="flex items-center space-x-2 border border-brand-border/60 bg-brand-dark/40 px-3.5 py-1.5 text-[10px] uppercase tracking-widest text-brand-cyan mb-6 animate-fade-in-up rounded-full font-semibold">
        <span className="h-1.5 w-1.5 bg-brand-emerald rounded-full animate-pulse"></span>
        <span>ATS Analyzer Active</span>
      </div>

      {/* Ultra-Premium Header */}
      <h1 className="text-5xl md:text-7xl font-black tracking-tight text-center max-w-4xl leading-[1.05] mb-6 animate-fade-in-up delay-100 uppercase select-none">
        Optimize Your Resume for <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-cyan to-brand-emerald">Applicant Systems</span>
      </h1>

      {/* Subtitle */}
      <p className="text-brand-muted text-sm md:text-base text-center max-w-xl leading-relaxed mb-8 animate-fade-in-up delay-200">
        Evaluate and optimize your resume matching score against any target job description instantly using our advanced AI-powered analyzer.
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
