import React from 'react';

export const PaywallModal = ({ isOpen, onClose, onCheckout, loading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/90 backdrop-blur-md animate-fade-in">
      {/* Outer Premium Container Box (Steel Frame / Cyber Brutalist Layout) */}
      <div className="relative w-full max-w-lg bg-brand-card border-2 border-brand-border p-8 hover-glow transition-spring duration-300">
        
        {/* Geometric Corner Tech Accents */}
        <div className="absolute top-[-2px] left-[-2px] h-4 w-4 border-t-2 border-l-2 border-brand-cyan"></div>
        <div className="absolute top-[-2px] right-[-2px] h-4 w-4 border-t-2 border-r-2 border-brand-cyan"></div>
        <div className="absolute bottom-[-2px] left-[-2px] h-4 w-4 border-b-2 border-l-2 border-brand-cyan"></div>
        <div className="absolute bottom-[-2px] right-[-2px] h-4 w-4 border-b-2 border-r-2 border-brand-cyan"></div>

        {/* Close Button */}
        <button 
          id="close-paywall-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-muted hover:text-brand-text font-mono text-xs uppercase tracking-widest transition-colors duration-200"
        >
          [ CLOSE_X ]
        </button>

        {/* Tech Icon Overlay */}
        <div className="text-4xl mb-6">🎯</div>

        {/* Paywall Header */}
        <span className="text-xs uppercase font-mono tracking-widest text-brand-rose font-bold block mb-2">
          SYS.LIMIT // FREE_WINDOW_EXPIRED
        </span>
        <h2 className="text-3xl font-black tracking-tight mb-4 uppercase leading-none">
          UNLOCK UNLIMITED SCANS
        </h2>
        
        <p className="text-brand-muted text-sm leading-relaxed mb-6 font-sans">
          You have successfully consumed your 3 free resume scans for today. Unlock engineering-grade lifetime premium access to clear applicant tracking filters instantly.
        </p>

        {/* Premium Bullet Checklist Container */}
        <div className="border border-brand-border/80 bg-[#020617] p-5 mb-8">
          <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-brand-cyan mb-4">
            INCLUDED_BENEFITS //
          </h3>
          <ul className="space-y-3 font-mono text-xs text-brand-muted">
            <li className="flex items-center">
              <span className="text-brand-emerald mr-3">●</span> UNLIMITED RESUME & JD EVALUATIONS
            </li>
            <li className="flex items-center">
              <span className="text-brand-emerald mr-3">●</span> FULL KEYWORD SYNONYMS MATCH MAPPING
            </li>
            <li className="flex items-center">
              <span className="text-brand-emerald mr-3">●</span> COPYABLE DYNAMIC AI SUGGESTION BOXES
            </li>
            <li className="flex items-center">
              <span className="text-brand-emerald mr-3">●</span> PRIORITY CLAUDE 3.5 ROUTING & SPEED
            </li>
            <li className="flex items-center">
              <span className="text-brand-emerald mr-3">●</span> PAY ONCE. OWN FOREVER ($9.00 FLAT RATE)
            </li>
          </ul>
        </div>

        {/* Stripe Gateway Checkout Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose text-xs font-mono">
            ⚠️ GATEWAY_FAILURE: {error}
          </div>
        )}

        {/* Dynamic Unlock Action Trigger */}
        <button
          id="stripe-checkout-btn"
          onClick={onCheckout}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-brand-cyan to-brand-emerald text-brand-dark font-extrabold uppercase font-mono tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
        >
          {loading ? (
            <span className="flex items-center space-x-2">
              <span className="animate-spin h-4 w-4 border-2 border-brand-dark border-t-transparent rounded-full"></span>
              <span>ESTABLISHING_STRIPE_CONNECTION...</span>
            </span>
          ) : (
            <span>ACTIVATE_LIFETIME_PREMIUM // $9.00</span>
          )}
        </button>

        {/* Secure Transaction Verification */}
        <p className="text-[9px] text-center text-brand-muted font-mono uppercase tracking-widest mt-4">
          SECURE PAYMENTS END-TO-END ENCRYPTED VIA STRIPE
        </p>

      </div>
    </div>
  );
};
