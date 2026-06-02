const Stripe = require('stripe');
const config = require('../config');
const logger = require('../utils/logger');

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2022-11-15' // Solid stable API version
});

const NS = 'StripeService';

/**
 * Generates a Stripe Checkout Session for $9 lifetime unlimited access
 * Uses inline price_data as a highly maintainable default, falling back to price ID if desired.
 * @returns {Promise<object>}
 */
const createCheckoutSession = async () => {
  logger.info(NS, 'Generating Stripe Checkout Session');

  // We support both a configured Stripe price ID or inline dynamic price data.
  // Dynamic inline price data is highly preferred as it requires 0 initial Stripe Dashboard setup!
  const lineItem = config.stripePriceId && config.stripePriceId !== 'price_12345'
    ? {
        price: config.stripePriceId,
        quantity: 1
      }
    : {
        price_data: {
          currency: config.stripeCurrency,
          product_data: {
            name: 'ATS Scorer - Lifetime Unlimited Access',
            description: 'Unlock unlimited resume matching, advanced skill-gap analyses, and dynamic resume rewrites.'
          },
          unit_amount: config.stripePriceAmount // $9.00 (900 cents)
        },
        quantity: 1
      };

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [lineItem],
      mode: 'payment',
      success_url: `${config.clientUrl}/?paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.clientUrl}/?canceled=true`
    });

    logger.info(NS, `Successfully created checkout session: ${session.id}`);
    return { id: session.id, url: session.url };
  } catch (error) {
    logger.error(NS, 'Failed to create Stripe Checkout Session', error);
    throw new Error('STRIPE_FAILED');
  }
};

module.exports = {
  createCheckoutSession
};
