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
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    // Reset previous states
    setError(null);
    setResults(null);

    if (!resumeText.trim() || !jobDescription.trim()) {
      setError({ code: 'MISSING_FIELDS', message: 'Both Resume and Job Description are required fields.' });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/analyze`, {
        resumeText,
        jobDescription,
        isPaid
      });

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
          message = 'Failed to analyze resume with Claude AI. Please try again.';
        } else if (code === 'PARSE_FAILED') {
          message = 'ATS rating engine returned invalid formatted results. Retrying could solve this.';
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
    jobDescription,
    setJobDescription,
    results,
    loading,
    error,
    analyze,
    reset
  };
};
