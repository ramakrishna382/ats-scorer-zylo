import { useState } from 'react';
import axios from 'axios';

// In development, talk to port 5000. In production, default to relative paths (same origin).
const API_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');

/**
 * Custom hook to manage ATS analysis API interactions
 * @param {boolean} isPaid 
 * @param {function} triggerPaywall 
 */
export const useAtsAnalysis = (isPaid, triggerPaywall) => {
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    // Reset previous states
    setError(null);
    setResults(null);

    const hasResumeInput = resumeFile || resumeText.trim();
    if (!hasResumeInput || !jobDescription.trim()) {
      setError({ code: 'MISSING_FIELDS', message: 'Both Resume (file or text) and Job Description are required fields.' });
      return;
    }

    setLoading(true);

    try {
      let response;
      if (resumeFile) {
        // Send as multipart/form-data for file uploads
        const formData = new FormData();
        formData.append('resumeFile', resumeFile);
        formData.append('jobDescription', jobDescription);
        formData.append('isPaid', isPaid);

        response = await axios.post(`${API_URL}/api/analyze`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Fall back to standard JSON payload for pasted text
        response = await axios.post(`${API_URL}/api/analyze`, {
          resumeText,
          jobDescription,
          isPaid
        });
      }

      setResults(response.data);
    } catch (err) {
      console.error('Analysis failed:', err);
      const apiError = err.response?.data;

      if (apiError && apiError.error) {
        // Capture specified error contract keys
        const code = apiError.error;
        let message = 'An unexpected server error occurred.';

        if (code === 'FREE_LIMIT_REACHED') {
          message = 'You have reached your 3 free scans limit for today.';
          triggerPaywall(); // Open Stripe paywall instantly!
        } else if (code === 'MISSING_FIELDS') {
          message = 'Inputs appear incomplete. Please check your text and retry.';
        } else if (code === 'CLAUDE_FAILED') {
          message = 'Failed to analyze resume with the AI service. Please try again.';
        } else if (code === 'PARSE_FAILED') {
          message = 'ATS rating engine returned invalid formatted results. Retrying could solve this.';
        } else if (code === 'FILE_TOO_LARGE') {
          message = apiError.detail || 'The uploaded file is too large (maximum 5MB).';
        } else if (code === 'INVALID_FILE_TYPE') {
          message = apiError.detail || 'Invalid file type. Please upload a PDF, DOCX, or TXT file.';
        } else if (code === 'EMPTY_EXTRACTED_TEXT') {
          message = apiError.detail || "We couldn't extract any readable text from this document.";
        } else if (code === 'FILE_PARSE_FAILED') {
          message = apiError.detail || 'Failed to extract text from the uploaded file.';
        }

        setError({ code, message, detail: apiError.detail });
      } else {
        setError({
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to the scoring server. Verify it is running.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResults(null);
    setError(null);
  };

  return {
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
  };
};
