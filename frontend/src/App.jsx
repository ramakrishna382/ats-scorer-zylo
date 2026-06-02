import React from 'react';
import { Hero } from './components/Hero';
import { ResumeUpload } from './components/ResumeUpload';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { AnalysisResults } from './components/AnalysisResults';
import { PaywallModal } from './components/PaywallModal';
import { useStripePayment } from './hooks/useStripePayment';
import { useAtsAnalysis } from './hooks/useAtsAnalysis';

function App() {
  const {
    isPaid,
    paywallOpen,
    openPaywall,
    closePaywall,
    checkoutLoading,
    checkoutError,
    triggerCheckout
  } = useStripePayment();

  const {
    resumeText,
    setResumeText,
    resumeFile,
    setResumeFile,
    jobDescription,
    setJobDescription,
    results,
    loading,
    error,
    analyze,
    reset
  } = useAtsAnalysis(isPaid, openPaywall);

  // Dynamic SEO metadata synchronization
  React.useEffect(() => {
    if (results && results.overallScore !== undefined) {
      document.title = `[SYS.ALIGNMENT.REPORT] Fit Score: ${results.overallScore}/100 - ATS Scorer`;
    } else {
      document.title = "Instant ATS Resume Scorer - Match Job Descriptions in Seconds";
    }
  }, [results]);

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-brand-dark text-brand-text font-sans">
      
      {/* Top Premium Status Navbar */}
      <nav className="w-full border-b border-brand-border/60 py-4 px-6 bg-brand-dark flex justify-between items-center z-10">
        <div className="flex items-center space-x-2.5 text-brand-text">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-emerald text-brand-dark font-extrabold text-sm select-none">
            🎯
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-extrabold tracking-tight text-sm uppercase leading-none">ATS Scorer</span>
            <span className="text-[9px] font-mono tracking-widest text-brand-cyan uppercase leading-none mt-1">Enterprise Pro</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {isPaid ? (
            <span className="px-3.5 py-1 bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs font-mono uppercase tracking-wider font-semibold rounded-full">
              Premium License Locked
            </span>
          ) : (
            <button
              id="get-premium-scans-btn"
              onClick={openPaywall}
              className="px-4 py-2 bg-brand-card hover:bg-slate-900 border border-brand-border hover:border-brand-cyan text-xs uppercase font-mono tracking-wider font-semibold transition-all duration-200 rounded-lg"
            >
              Get Premium Scans
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section Header (Always present unless showing results for maximum semantic consistency) */}
      {!results && <Hero />}

      {/* Main Screen Layout Container */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 pb-16">
        {!results ? (
          <div className="space-y-8">
            
            {/* Input Cards Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
                limit={3000}
              />
              <ResumeUpload
                value={resumeText}
                onChange={setResumeText}
                file={resumeFile}
                onFileChange={setResumeFile}
                limit={3000}
              />
            </div>

            {/* General App/Validation Errors */}
            {error && error.code !== 'FREE_LIMIT_REACHED' && (
              <div className="w-full p-4 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose text-xs font-mono rounded-lg">
                ⚠️ Error: {error.message} {error.detail ? `(${error.detail})` : ''}
              </div>
            )}

            {/* Scoring Execution CTA Bar */}
            <div className="flex flex-col items-center pt-4">
              <button
                id="score-resume-btn"
                onClick={analyze}
                disabled={loading}
                className="w-full max-w-lg py-4 bg-brand-emerald hover:bg-emerald-500 text-brand-dark font-extrabold uppercase font-mono tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border-2 border-transparent rounded-xl shadow-lg shadow-brand-emerald/10"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="animate-spin h-5 w-5 border-2 border-brand-dark border-t-transparent rounded-full"></span>
                    <span>Analyzing Resume...</span>
                  </span>
                ) : (
                  <span>Score Candidate Resume</span>
                )}
              </button>
              
              <span className="text-[10px] text-brand-muted uppercase font-mono tracking-wider mt-3">
                {isPaid ? 'Premium Bypass Active - Unlimited Free Scans' : 'Consumes 1 Free Scan (3 Attempts Remaining Today)'}
              </span>
            </div>

          </div>
        ) : (
          <AnalysisResults
            results={results}
            onReset={reset}
          />
        )}
      </main>

      {/* Footer Branding Area */}
      <footer className="w-full py-8 border-t border-brand-border bg-[#030712] mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-brand-muted uppercase tracking-widest font-mono">
          <span>© 2026 ATS SCORER INC. ALL RIGHTS RESERVED.</span>
          <span className="mt-4 md:mt-0 text-brand-cyan">SECURED WORKLOAD VIA ANTHROPIC CLAUDE 3.5</span>
        </div>
      </footer>

      {/*stripe Paywall Modal Dialog */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={closePaywall}
        onCheckout={triggerCheckout}
        loading={checkoutLoading}
        error={checkoutError}
      />

    </div>
  );
}

export default App;
