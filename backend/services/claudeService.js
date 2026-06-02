const { Anthropic } = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const logger = require('../utils/logger');

// Initialize API clients conditionally to avoid startup crashes if keys are omitted
let anthropic = null;
if (config.anthropicApiKey) {
  anthropic = new Anthropic({
    apiKey: config.anthropicApiKey
  });
}

let geminiAI = null;
if (config.geminiApiKey) {
  geminiAI = new GoogleGenerativeAI(config.geminiApiKey);
}

const NS = 'ClaudeService';

/**
 * Trims a text block to the specified character limit
 * @param {string} text 
 * @param {number} limit 
 * @returns {string}
 */
const truncateText = (text, limit) => {
  if (!text) return '';
  return text.length > limit ? text.substring(0, limit) + '...' : text;
};

/**
 * Cleans markdown JSON block markers if present in Claude output
 * @param {string} text 
 * @returns {string}
 */
const cleanJsonString = (text) => {
  let cleaned = text.trim();
  
  // Handle markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  return cleaned.trim();
};

/**
 * Analyzes resume against job description using Claude
 * @param {string} resumeText 
 * @param {string} jobDescription 
 * @returns {Promise<object>}
 */
const analyzeResume = async (resumeText, jobDescription) => {
  // Truncate input offensively for security & token control
  const jdTrunc = truncateText(jobDescription, config.inputTruncateLimit);
  const resumeTrunc = truncateText(resumeText, config.inputTruncateLimit);

  logger.info(NS, `Initiating ATS analysis on Claude (Model: ${config.anthropicModel})`);
  logger.debug(NS, `JD character length: ${jdTrunc.length}, Resume character length: ${resumeTrunc.length}`);

  const systemInstructions = `You are a professional applicant tracking system (ATS) rating algorithm. Your job is to analyze a candidate's resume text against a target Job Description (JD).
Return ONLY a valid JSON string with absolutely no introductory or concluding text, and NO markdown code block fencing (do not wrap in \`\`\`json ... \`\`\`).

The JSON output MUST follow this exact schema:
{
  "overallScore": 0-100,
  "breakdown": {
    "keywords": 0-100,
    "experience": 0-100,
    "skills": 0-100,
    "formatting": 0-100
  },
  "matchedKeywords": ["string", ...],
  "missingKeywords": ["string", ...],
  "partialKeywords": ["string", ...],
  "rewrites": [
    {
      "section": "Summary | Experience | Skills | Education",
      "issue": "one sentence explaining the issue",
      "suggestion": "specific rewrite or improvement"
    }
  ],
  "quickTips": ["tip1", "tip2", "tip3"]
}

Evaluate based on these criteria:
- keywords: direct term overlap between JD requirements and resume text
- experience: years + seniority level match to JD expectations
- skills: hard skills coverage (tools, languages, certifications)
- formatting: ATS-hostile signals (tables, graphics implied by structure, missing section headers)`;

  const userPrompt = `Target Job Description:
---
${jdTrunc}
---

Candidate Resume:
---
${resumeTrunc}
---

Please perform the scoring and return the specified JSON structure.`;

  try {
    let rawContent;

    if (config.aiProvider === 'gemini') {
      if (!geminiAI) {
        throw new Error('Gemini API key is not configured.');
      }
      logger.info(NS, 'Routing analysis request to Google Gemini (gemini-2.5-flash)');
      
      const model = geminiAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemInstructions,
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const response = await model.generateContent(userPrompt);
      rawContent = response.response.text();
    } else {
      if (!anthropic) {
        throw new Error('Anthropic API key is not configured.');
      }
      logger.info(NS, `Routing analysis request to Anthropic Claude (${config.anthropicModel})`);
      
      const response = await anthropic.messages.create({
        model: config.anthropicModel,
        max_tokens: 1500,
        system: systemInstructions,
        messages: [{ role: 'user', content: userPrompt }]
      });

      rawContent = response.content[0].text;
    }

    logger.debug(NS, 'Received raw response from AI service');

    const cleaned = cleanJsonString(rawContent);

    try {
      const parsed = JSON.parse(cleaned);
      logger.info(NS, 'Successfully parsed resume analysis JSON response');
      return parsed;
    } catch (parseError) {
      logger.error(NS, 'Failed to parse JSON returned by Claude.', parseError);
      logger.error(NS, `Raw response content: \n${rawContent}`);
      throw new Error('PARSE_FAILED');
    }
  } catch (apiError) {
    if (apiError.message === 'PARSE_FAILED') {
      throw apiError;
    }
    logger.error(NS, 'Error executing Claude API request', apiError);
    throw new Error('CLAUDE_FAILED');
  }
};

module.exports = {
  analyzeResume
};
