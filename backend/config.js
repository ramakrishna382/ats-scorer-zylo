const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root directory .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePriceId: process.env.STRIPE_PRICE_ID || 'price_12345',
  stripeCurrency: process.env.STRIPE_CURRENCY || 'usd',
  stripePriceAmount: parseInt(process.env.STRIPE_PRICE_AMOUNT || '900', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '86400000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '3', 10),
  inputTruncateLimit: parseInt(process.env.INPUT_TRUNCATE_LIMIT || '3000', 10)
};

// Defensive startup assertion checks
const missingKeys = [];
if (!config.anthropicApiKey) {
  missingKeys.push('ANTHROPIC_API_KEY');
}
if (!config.stripeSecretKey) {
  missingKeys.push('STRIPE_SECRET_KEY');
}

if (missingKeys.length > 0) {
  console.error('\n======================================================');
  console.error(' 🚨 SERVER INTRINSIC CONFIGURATION ERROR');
  console.error('======================================================');
  console.error(` The following critical environment variables are missing:\n`);
  missingKeys.forEach(key => console.error(`  - ${key}`));
  console.error('\n Please copy the root `.env.example` to `.env` and fill');
  console.error(' in the missing credentials before booting the application.');
  console.error('======================================================\n');
  process.exit(1);
}

module.exports = config;
