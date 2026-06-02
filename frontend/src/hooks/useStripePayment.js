import { useState, useEffect } from 'react';
import axios from 'axios';

// In development, talk to port 5000. In production, default to relative paths (same origin).
const API_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');
const STORAGE_KEY = 'ats_scorer_paid_license';

export const useStripePayment = () => {
  const [isPaid, setIsPaid] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [paywallOpen, setPaywallOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  useEffect(() => {
    // Audit URL search parameters for payment success redirect
    const params = new URLSearchParams(window.location.search);
    const paidParam = params.get('paid');
    const sessionId = params.get('session_id');

    if (paidParam === 'true' && sessionId) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsPaid(true);
        setPaywallOpen(false);
        
        // Clean redirect parameters from browser history for clean URL aesthetic
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (err) {
        console.error('Failed to persist payment status to storage', err);
      }
    }
  }, []);

  const triggerCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await axios.post(`${API_URL}/api/stripe/create-checkout-session`);
      const { url } = response.data;
      
      if (url) {
        // Redirect to Stripe checkout page
        window.location.href = url;
      } else {
        throw new Error('Checkout URL missing from API response');
      }
    } catch (err) {
      console.error('Failed to execute checkout:', err);
      const apiError = err.response?.data;
      
      setCheckoutError(
        apiError?.detail || 'Failed to create payment gateway checkout session. Check console.'
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const closePaywall = () => setPaywallOpen(false);
  const openPaywall = () => setPaywallOpen(true);

  return {
    isPaid,
    paywallOpen,
    openPaywall,
    closePaywall,
    checkoutLoading,
    checkoutError,
    triggerCheckout
  };
};
