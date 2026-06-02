import React, { useState, useRef } from 'react';

export const ResumeUpload = ({ value, onChange, file, onFileChange, limit }) => {
  const [activeTab, setActiveTab] = useState(file ? 'file' : (value ? 'text' : 'file'));
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [focused, setFocused] = useState(false);
  const fileInputRef = useRef(null);

  const charCount = value.length;
  const fillPercentage = Math.min((charCount / limit) * 100, 100);

  // Dynamic progress line coloring for text input
  const getProgressColor = () => {
    if (charCount > limit - 200) return 'bg-brand-rose';
    if (charCount > limit - 800) return 'bg-brand-amber';
    return 'bg-brand-cyan';
  };

  // Helper to format bytes
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const validateAndSetFile = (uploadedFile) => {
    setFileError(null);
    if (!uploadedFile) return;

    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const fileName = uploadedFile.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    const isValidMime = allowedMimeTypes.includes(uploadedFile.type) || uploadedFile.type.startsWith('text/');

    if (!isValidExtension && !isValidMime) {
      setFileError('Unsupported file type. Please upload a PDF, Word (.docx), or Text (.txt) file.');
      return;
    }

    if (uploadedFile.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds the 5MB maximum limit.');
      return;
    }

    // Mutually exclusive: if file is loaded, clear pasted text
    onChange('');
    onFileChange(uploadedFile);
  };

  // Drag and drop event handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextChange = (text) => {
    // Mutually exclusive: if text is pasted, clear the file
    if (file) {
      onFileChange(null);
    }
    onChange(text);
  };

  const selectTab = (tab) => {
    setActiveTab(tab);
    setFileError(null);
  };

  return (
    <div className={`w-full bg-brand-card border p-6 transition-all duration-300 relative rounded-xl ${
      focused || dragActive 
        ? 'border-brand-cyan/80 shadow-[0_0_24px_rgba(6,182,212,0.06)]' 
        : 'border-brand-border/60'
    }`}>
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-brand-border/40 pb-4">
        <label className="text-sm font-bold tracking-tight text-brand-text flex items-center cursor-pointer select-none">
          <span className="text-brand-cyan mr-2">📄</span> Candidate Resume
        </label>
        
        {/* Modern Segmented Control Tab Navigation */}
        <div className="flex p-1 bg-slate-950 rounded-lg border border-brand-border/40 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => selectTab('file')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-all duration-200 ${
              activeTab === 'file'
                ? 'bg-brand-cyan text-brand-dark font-extrabold shadow-sm'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => selectTab('text')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-all duration-200 ${
              activeTab === 'text'
                ? 'bg-brand-cyan text-brand-dark font-extrabold shadow-sm'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            Paste Text
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'file' ? (
        <div className="w-full">
          {file ? (
            /* File Detail display */
            <div className="h-72 flex flex-col justify-center items-center border border-brand-emerald/30 bg-brand-emerald/5 rounded-lg p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-brand-emerald/5 to-transparent pointer-events-none"></div>
              
              <div className="w-16 h-16 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {file.name.toLowerCase().endsWith('.pdf') ? '📕' : file.name.toLowerCase().endsWith('.txt') ? '📝' : '📘'}
              </div>
              
              <span className="text-sm font-bold text-brand-text tracking-tight text-center max-w-xs truncate mb-1">
                {file.name}
              </span>
              
              <span className="text-xs font-mono text-brand-muted mb-6">
                Size: {formatBytes(file.size)}
              </span>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="px-4 py-2 border border-brand-rose/25 hover:border-brand-rose bg-brand-rose/10 hover:bg-brand-rose/20 text-brand-rose text-xs font-mono uppercase tracking-wider font-semibold rounded-lg transition-all duration-200"
              >
                Remove Document
              </button>
            </div>
          ) : (
            /* Drag and drop zone */
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`h-72 border-2 border-dashed rounded-lg flex flex-col justify-center items-center p-6 cursor-pointer transition-all duration-300 ${
                dragActive
                  ? 'border-brand-cyan bg-brand-cyan/5'
                  : 'border-brand-border/60 hover:border-brand-cyan/60 bg-[#020617] hover:bg-slate-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain"
                onChange={handleFileSelect}
              />
              
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl mb-4 transition-transform duration-300 ${
                dragActive ? 'bg-brand-cyan/20 scale-110 text-brand-cyan' : 'bg-brand-border/20 text-brand-muted'
              }`}>
                📥
              </div>
              
              <p className="text-sm font-semibold text-brand-text tracking-tight mb-1 text-center">
                Drag & drop your resume file here
              </p>
              <p className="text-xs text-brand-muted text-center mb-4">
                PDF, Word (.docx), or Text (.txt) up to 5MB
              </p>
              
              <button
                type="button"
                className="px-4 py-2 bg-brand-card hover:bg-slate-900 border border-brand-border text-xs uppercase font-mono tracking-wider font-semibold transition-all duration-200 rounded-lg text-brand-text"
              >
                Browse Files
              </button>
            </div>
          )}

          {fileError && (
            <div className="mt-4 p-3 bg-brand-rose/10 border border-brand-rose/25 text-brand-rose text-xs font-mono rounded-lg">
              ⚠️ {fileError}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full">
          <textarea
            id="resume-input-textarea"
            value={value}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Paste plain text resume details (Summary, Experience, Skills, Education) here..."
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
            <span className="text-brand-muted font-medium">
              Status: {charCount > 0 ? <span className="text-brand-emerald font-semibold">Loaded</span> : <span className="text-brand-muted">Awaiting Input</span>}
            </span>
            
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
      )}
    </div>
  );
};
