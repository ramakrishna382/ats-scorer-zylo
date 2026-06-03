const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const logger = require('./utils/logger');

// Express routes
const analyzeRouter = require('./routes/analyze');
const stripeRouter = require('./routes/stripe');

const app = express();
const NS = 'ExpressApp';

// Apply HTTP security headers
app.use(helmet());

// Enable CORS for client API requests
app.use(cors({
  origin: config.clientUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser
app.use(express.json());

// Log incoming API calls
app.use((req, res, next) => {
  logger.debug(NS, `Incoming ${req.method} request to ${req.originalUrl} from IP ${req.ip}`);
  next();
});

// Register routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/stripe', stripeRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static frontend assets in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const frontendDistPath = path.join(__dirname, '../frontend/dist');
  const landingDistPath = path.join(__dirname, '../frontend-landing/dist');
  
  // Direct global route for ads.txt (failsafe for Google AdSense verification)
  app.get('/ads.txt', (req, res) => {
    res.type('text/plain');
    res.send('google.com, pub-8681805901258340, DIRECT, f08c47fec0942fa0\n');
  });

  // Serve static assets conditionally based on domain
  app.use((req, res, next) => {
    const host = req.hostname;
    const isScorer = host === 'atsscore.zyloconnect.com' || host === 'ats-scorer.fly.dev';
    
    if (isScorer) {
      express.static(frontendDistPath)(req, res, next);
    } else {
      express.static(landingDistPath)(req, res, next);
    }
  });
  
  // Catch-all route to serve React's index.html for client-side routing
  app.get('*', (req, res) => {
    // Exclude API and health routes from catch-all to prevent false positives
    if (req.originalUrl.startsWith('/api') || req.originalUrl === '/health') {
      return res.status(404).json({ error: 'NOT_FOUND', detail: `Endpoint ${req.originalUrl} not found` });
    }
    
    const host = req.hostname;
    const isScorer = host === 'atsscore.zyloconnect.com' || host === 'ats-scorer.fly.dev';
    
    if (isScorer) {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    } else {
      res.sendFile(path.join(landingDistPath, 'index.html'));
    }
  });
} else {
  // Unhandled route fallback (development)
  app.use((req, res) => {
    res.status(404).json({ error: 'NOT_FOUND', detail: `Endpoint ${req.originalUrl} not found` });
  });
}

// Start Express server
const server = app.listen(config.port, () => {
  logger.info(NS, `======================================================`);
  logger.info(NS, ` 🚀 ATS Scorer Express Server Booted Successfully!`);
  logger.info(NS, `======================================================`);
  logger.info(NS, `  - Running on Port:  http://localhost:${config.port}`);
  logger.info(NS, `  - Allowed Client:   ${config.clientUrl}`);
  logger.info(NS, `  - Claude Model:     ${config.anthropicModel}`);
  logger.info(NS, `  - Currency/Amount:  ${config.stripeCurrency.toUpperCase()} ${(config.stripePriceAmount / 100).toFixed(2)}`);
  logger.info(NS, `  - Free Limit Window: ${(config.rateLimitWindowMs / 3600000).toFixed(1)} hrs`);
  logger.info(NS, `  - Free Limit Max:   ${config.rateLimitMax} scans`);
  logger.info(NS, `======================================================`);
});

// Handle uncaught exceptions gracefully
process.on('unhandledRejection', (reason, promise) => {
  logger.error(NS, 'Unhandled Promise Rejection detected', reason);
});

process.on('uncaughtException', (error) => {
  logger.error(NS, 'Uncaught Exception detected', error);
  process.exit(1);
});
