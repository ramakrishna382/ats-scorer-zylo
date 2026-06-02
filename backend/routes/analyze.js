const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const claudeService = require('../services/claudeService');
const logger = require('../utils/logger');

const router = express.Router();
const NS = 'AnalyzeRoute';

// 24 hours rate limiter: 3 requests per IP. Skip if body has isPaid: true
const analysisLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  skip: (req) => {
    const isPaid = req.body && req.body.isPaid === true;
    if (isPaid) {
      logger.info(NS, `Bypassing rate limit for IP ${req.ip} (isPaid = true)`);
    }
    return isPaid;
  },
  handler: (req, res) => {
    logger.warn(NS, `Rate limit reached for IP ${req.ip}`);
    return res.status(429).json({ error: 'FREE_LIMIT_REACHED' });
  }
});

/**
 * POST /api/analyze
 * Analyzes resume text against job description text
 */
router.post('/', analysisLimiter, async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !jobDescription) {
    logger.warn(NS, 'Missing resumeText or jobDescription fields');
    return res.status(400).json({ error: 'MISSING_FIELDS' });
  }

  try {
    const scoreResults = await claudeService.analyzeResume(resumeText, jobDescription);
    return res.json(scoreResults);
  } catch (error) {
    logger.error(NS, 'Resume analysis route failure', error);

    if (error.message === 'PARSE_FAILED') {
      return res.status(500).json({ 
        error: 'PARSE_FAILED', 
        detail: 'Claude returned invalid JSON response that could not be parsed' 
      });
    }

    if (error.message === 'CLAUDE_FAILED') {
      return res.status(500).json({ 
        error: 'CLAUDE_FAILED', 
        detail: 'Failed to communicate with Anthropic AI service' 
      });
    }

    return res.status(500).json({ 
      error: 'SERVER_ERROR', 
      detail: error.message 
    });
  }
});

module.exports = router;
