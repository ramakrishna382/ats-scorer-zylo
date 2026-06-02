const express = require('express');
const stripeService = require('../services/stripeService');
const logger = require('../utils/logger');

const router = express.Router();
const NS = 'StripeRoute';

/**
 * POST /api/stripe/create-checkout-session
 * Generates a Stripe checkout session for flat-rate lifetime paywall unlock
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripeService.createCheckoutSession();
    return res.json({ id: session.id, url: session.url });
  } catch (error) {
    logger.error(NS, 'Stripe checkout route failure', error);
    
    return res.status(500).json({
      error: 'STRIPE_FAILED',
      detail: error.message || 'Stripe API checkout generation failed'
    });
  }
});

module.exports = router;
