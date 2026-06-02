const express = require('express');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const config = require('../config');
const claudeService = require('../services/claudeService');
const logger = require('../utils/logger');

const router = express.Router();
const NS = 'AnalyzeRoute';

// Configure in-memory file storage using multer with a 5MB size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Middleware to handle multer file upload and handle size limit error
const uploadSingle = (req, res, next) => {
  upload.single('resumeFile')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          logger.warn(NS, `File upload rejected: exceeds 5MB size limit`);
          return res.status(400).json({
            error: 'FILE_TOO_LARGE',
            detail: 'The uploaded file exceeds the maximum 5MB size limit.'
          });
        }
        logger.warn(NS, `Multer error during upload: ${err.message}`);
        return res.status(400).json({ error: 'FILE_UPLOAD_ERROR', detail: err.message });
      }
      logger.error(NS, 'Unknown error during file upload', err);
      return res.status(400).json({ error: 'FILE_UPLOAD_ERROR', detail: err.message });
    }
    next();
  });
};

// 24 hours rate limiter: 3 requests per IP. Skip if body has isPaid: true or 'true'
const analysisLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  skip: (req) => {
    const isPaid = req.body && (req.body.isPaid === true || req.body.isPaid === 'true');
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
 * Analyzes resume (uploaded file or pasted text) against job description text
 */
router.post('/', uploadSingle, analysisLimiter, async (req, res) => {
  let resumeText = req.body.resumeText;
  const { jobDescription } = req.body;

  if (!jobDescription) {
    logger.warn(NS, 'Missing jobDescription field');
    return res.status(400).json({ error: 'MISSING_FIELDS', detail: 'Job description is required.' });
  }

  // Extract text from uploaded file if present
  if (req.file) {
    const mimeType = req.file.mimetype;
    const buffer = req.file.buffer;
    const originalname = req.file.originalname.toLowerCase();

    logger.info(NS, `Processing uploaded file: name=${req.file.originalname}, size=${req.file.size} bytes, mime=${mimeType}`);

    try {
      if (mimeType === 'application/pdf' || originalname.endsWith('.pdf')) {
        const data = await pdfParse(buffer);
        resumeText = data.text;
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword' ||
        originalname.endsWith('.docx')
      ) {
        const result = await mammoth.extractRawText({ buffer });
        resumeText = result.value;
      } else if (mimeType === 'text/plain' || originalname.endsWith('.txt')) {
        resumeText = buffer.toString('utf8');
      } else {
        logger.warn(NS, `Unsupported file type uploaded: mime=${mimeType}, name=${req.file.originalname}`);
        return res.status(400).json({
          error: 'INVALID_FILE_TYPE',
          detail: 'Unsupported file type. Please upload a PDF, Word (.docx), or Text (.txt) file.'
        });
      }

      // Verify that the extracted text is valid and not empty (e.g. scanned PDF / image-only)
      if (!resumeText || resumeText.trim().length < 50) {
        logger.warn(NS, `Extracted text is empty or too short. Length: ${resumeText ? resumeText.trim().length : 0}`);
        return res.status(400).json({
          error: 'EMPTY_EXTRACTED_TEXT',
          detail: "We couldn't extract any readable text from this document. If it is a scanned image, please upload a text-based document or copy-paste the text instead."
        });
      }
    } catch (parseError) {
      logger.error(NS, 'Error parsing uploaded file', parseError);
      return res.status(400).json({
        error: 'FILE_PARSE_FAILED',
        detail: 'Failed to extract text from the uploaded file. Please make sure the file is not corrupted.'
      });
    }
  }

  if (!resumeText) {
    logger.warn(NS, 'Missing resumeText or uploaded resume file');
    return res.status(400).json({ error: 'MISSING_FIELDS', detail: 'Please upload a resume or paste your resume text.' });
  }

  try {
    const scoreResults = await claudeService.analyzeResume(resumeText, jobDescription);
    return res.json(scoreResults);
  } catch (error) {
    logger.error(NS, 'Resume analysis route failure', error);

    if (error.message === 'PARSE_FAILED') {
      return res.status(500).json({ 
        error: 'PARSE_FAILED', 
        detail: 'The AI model returned an invalid response structure. Please try again.' 
      });
    }

    if (error.message === 'CLAUDE_FAILED') {
      return res.status(500).json({ 
        error: 'CLAUDE_FAILED', 
        detail: 'Failed to communicate with the AI service. Please verify your API keys.' 
      });
    }

    return res.status(500).json({ 
      error: 'SERVER_ERROR', 
      detail: error.message 
    });
  }
});

module.exports = router;
