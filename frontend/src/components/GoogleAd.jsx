import React, { useEffect } from 'react';

/**
 * Reusable Google AdSense component
 * @param {string} slot - Ad slot ID from your Google AdSense dashboard. If omitted, shows a developer placeholder.
 * @param {string} format - Format of the ad: 'auto', 'fluid', etc.
 * @param {boolean} responsive - Enables responsive sizing.
 */
export const GoogleAd = ({ slot, format = 'auto', responsive = 'true' }) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Push ad to Google AdSense array
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn('AdSense script not loaded yet or ad blocked:', err.message);
    }
  }, [slot]);

  // If no slot is configured yet, render a beautiful placeholder so the UI looks complete in dev
  const isDev = !slot || import.meta.env.DEV;

  return (
    <div className="w-full my-6 flex flex-col items-center justify-center select-none">
      <span className="text-[9px] font-mono tracking-widest text-brand-muted/40 uppercase mb-2">
        Sponsored Advertisement
      </span>
      <div className="w-full max-w-4xl min-h-[90px] bg-slate-950/40 border border-brand-border/30 hover:border-brand-cyan/20 transition-all duration-300 rounded-lg p-3 flex flex-col items-center justify-center overflow-hidden relative">
        
        {isDev && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-center p-4">
            <span className="text-[11px] font-semibold text-brand-cyan tracking-wider uppercase mb-1">
              Google AdSense Preview
            </span>
            <span className="text-[10px] text-brand-muted max-w-md font-mono">
              {slot ? `Active Slot ID: ${slot}` : 'Auto Ads Active (Loads real ads in production)'}
            </span>
          </div>
        )}

        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '90px' }}
          data-ad-client="ca-pub-8681805901258340"
          data-ad-slot={slot || '1234567890'} // dummy slot fallback
          data-ad-format={format}
          data-full-width-responsive={responsive}
        ></ins>
      </div>
    </div>
  );
};
