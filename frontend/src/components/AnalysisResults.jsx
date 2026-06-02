import React, { useState } from 'react';

export const AnalysisResults = ({ results, onReset }) => {
  if (!results) return null;
  const [copiedIndex, setCopiedIndex] = useState(null);

  const { overallScore, breakdown, matchedKeywords, missingKeywords, partialKeywords, rewrites, quickTips } = results;

  // Visual metric score mapping
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-brand-emerald';
    if (score >= 50) return 'text-brand-amber';
    return 'text-brand-rose';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-brand-emerald/10 border-brand-emerald/30';
    if (score >= 50) return 'bg-brand-amber/10 border-brand-amber/30';
    return 'bg-brand-rose/10 border-brand-rose/30';
  };

  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-brand-emerald';
    if (score >= 50) return 'bg-brand-amber';
    return 'bg-brand-rose';
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // SVG Circular path configuration
  const radius = 80;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
      
      {/* Header Info Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-brand-cyan flex items-center">
            <span className="h-1.5 w-1.5 bg-brand-emerald mr-2"></span> METRIC.REPORT.01 // READY
          </span>
          <h2 className="text-3xl font-black tracking-tight uppercase">ATS ALIGNMENT OVERVIEW</h2>
        </div>
        <button
          id="reset-scoring-button"
          onClick={onReset}
          className="px-5 py-3 border border-brand-border font-mono text-xs uppercase tracking-widest hover:bg-slate-900 focus:outline-none transition-colors duration-200"
        >
          [ ← RUN_NEW_EVALUATION ]
        </button>
      </div>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* SVG HUD Radial Score Gauge */}
        <div className="lg:col-span-1 bg-brand-card border border-brand-border p-8 flex flex-col items-center justify-center relative select-none">
          <div className="absolute top-3 left-3 text-[9px] font-mono uppercase tracking-widest text-brand-muted">
            GAUGE_01
          </div>
          
          <div className="relative flex items-center justify-center h-48 w-48">
            {/* SVG Circular Ring Gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                stroke="#1e293b"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="w-full h-full"
              />
              <circle
                stroke={overallScore >= 80 ? '#10b981' : overallScore >= 50 ? '#f59e0b' : '#f43f5e'}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="square"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            <div className="absolute text-center">
              <span className={`text-6xl font-black font-mono tracking-tighter ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <span className="text-[10px] font-mono text-brand-muted block uppercase tracking-wider mt-1">
                JD_MATCH
              </span>
            </div>
          </div>

          <div className="text-center mt-6">
            <div className={`inline-block px-3 py-1 border text-xs font-mono uppercase font-semibold mb-3 ${getScoreBg(overallScore)}`}>
              {overallScore >= 80 ? 'CRITICAL_PASS' : overallScore >= 50 ? 'MARGINAL_ALIGN' : 'DEFICIT_DETECTED'}
            </div>
            <p className="text-xs text-brand-muted font-mono leading-relaxed max-w-xs mx-auto">
              This score models search crawler indexing relevance based on strict JD criteria parsing.
            </p>
          </div>
        </div>

        {/* Categories Progress HUD Bars */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border p-8 flex flex-col justify-between">
          <div className="w-full">
            <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-brand-cyan mb-6">
              SYS.ALIGNMENT.WEIGHTS //
            </h3>
            
            <div className="space-y-6">
              {Object.entries(breakdown || {}).map(([key, score]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="uppercase tracking-widest text-brand-text">{key}</span>
                    <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                  </div>
                  <div className="w-full bg-[#020617] h-[8px] relative border border-brand-border/40">
                    <div 
                      className={`h-full ${getProgressColor(score)} transition-all duration-1000 ease-out`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-brand-border/40 text-[10px] text-brand-muted font-mono uppercase tracking-widest">
            PARSED DIRECTLY BY CLAUDE_SONNET_3.5_ENGINE
          </div>
        </div>
      </div>

      {/* Keywords Mapping Section */}
      <div className="bg-brand-card border border-brand-border p-8 mb-12">
        <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-brand-cyan mb-6">
          SYS.KEYWORDS.MAPPING //
        </h3>
        
        <div className="space-y-6 font-mono">
          {/* Matched Keywords */}
          <div>
            <h4 className="text-xs text-brand-muted uppercase mb-3 tracking-wide">✓ MATCHED TERMS ({matchedKeywords?.length || 0})</h4>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords?.map((keyword, i) => (
                <span key={i} className="px-3 py-1.5 bg-brand-emerald/5 border border-brand-emerald/30 text-brand-emerald text-xs tracking-tight">
                  {keyword}
                </span>
              ))}
              {(!matchedKeywords || matchedKeywords.length === 0) && (
                <span className="text-xs text-brand-muted italic uppercase">[0_KEYWORDS_DETECTED]</span>
              )}
            </div>
          </div>

          {/* Partial Keywords */}
          {partialKeywords && partialKeywords.length > 0 && (
            <div>
              <h4 className="text-xs text-brand-muted uppercase mb-3 tracking-wide">~ SYNONYMS & PARTIALS ({partialKeywords.length})</h4>
              <div className="flex flex-wrap gap-2">
                {partialKeywords.map((keyword, i) => (
                  <span key={i} className="px-3 py-1.5 bg-brand-amber/5 border border-brand-amber/30 text-brand-amber text-xs tracking-tight">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          <div>
            <h4 className="text-xs text-brand-muted uppercase mb-3 tracking-wide">✖ CRITICAL DEFICITS ({missingKeywords?.length || 0})</h4>
            <div className="flex flex-wrap gap-2">
              {missingKeywords?.map((keyword, i) => (
                <span key={i} className="px-3 py-1.5 bg-brand-rose/5 border border-brand-rose/30 text-brand-rose text-xs tracking-tight animate-pulse">
                  {keyword}
                </span>
              ))}
              {(!missingKeywords || missingKeywords.length === 0) && (
                <span className="text-xs text-brand-emerald uppercase font-semibold">
                  [ALL_CRITICAL_KEYWORDS_FULFILLED]
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Resume Section Rewrites */}
      <div className="bg-brand-card border border-brand-border p-8 mb-12">
        <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-brand-cyan mb-6">
          SYS.REWRITES.MODULE //
        </h3>
        
        <div className="space-y-6">
          {rewrites?.map((rewrite, i) => (
            <div key={i} className="border border-brand-border/80 p-6 bg-[#020617] flex flex-col lg:flex-row gap-6 relative transition-spring duration-300 hover:border-brand-cyan">
              
              <div className="lg:w-1/4">
                <span className="px-3 py-1.5 bg-slate-900 border border-brand-border/60 text-brand-cyan text-xs uppercase font-mono font-bold tracking-widest block text-center">
                  {rewrite.section}
                </span>
              </div>

              <div className="lg:w-3/4 space-y-4">
                <div>
                  <h4 className="text-xs uppercase font-mono text-brand-rose tracking-wider font-semibold">IDENTIFIED_DEFICIT:</h4>
                  <p className="text-sm text-brand-muted mt-1 leading-relaxed">{rewrite.issue}</p>
                </div>
                
                <div className="border border-brand-border bg-brand-card p-5 relative overflow-hidden">
                  <h4 className="text-xs uppercase font-mono text-brand-emerald font-bold tracking-wider flex justify-between items-center mb-3">
                    <span>PROPOSED_UPGRADE:</span>
                    <button 
                      id={`copy-rewrite-btn-${i}`}
                      onClick={() => copyToClipboard(rewrite.suggestion, i)}
                      className="text-[10px] text-brand-cyan hover:underline uppercase tracking-widest font-mono focus:outline-none"
                    >
                      {copiedIndex === i ? '[ COPIED_TO_CLIPBOARD! ]' : '[ COPY_REWRITE ]'}
                    </button>
                  </h4>
                  <p className="text-sm font-mono text-brand-text leading-relaxed italic select-all">
                    "{rewrite.suggestion}"
                  </p>
                </div>
              </div>

            </div>
          ))}
          {(!rewrites || rewrites.length === 0) && (
            <div className="text-center py-8 text-brand-muted font-mono uppercase text-xs">
              [ 0_DEFICITS_IDENTIFIED_IN_RESUME_TEXT ]
            </div>
          )}
        </div>
      </div>

      {/* Immediate Tips Checklist */}
      <div className="bg-brand-card border border-brand-border p-8">
        <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-brand-cyan mb-4">
          SYS.CHECKLIST.IMMEDIATE //
        </h3>
        <ul className="space-y-4 font-mono">
          {quickTips?.map((tip, i) => (
            <li key={i} className="flex items-start text-sm text-brand-muted leading-relaxed">
              <span className="text-brand-cyan mr-3 select-none">[{String(i + 1).padStart(2, '0')}]</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};
