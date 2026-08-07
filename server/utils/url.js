const AppError = require('../utils/appError');

/**
 * Normalizes a user-supplied URL for Puppeteer.
 * - Trims whitespace, prepends https:// when no protocol is given,
 * - Validates the result and throws a 400 AppError if it is not a usable http(s) URL.
 */
function normalizeUrl(input) {
  if (!input || typeof input !== 'string') {
    throw new AppError(400, 'Please provide a URL to analyze.');
  }

  let candidate = input.trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new AppError(400, `"${input}" does not look like a valid URL.`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new AppError(400, 'Only http:// and https:// URLs can be analyzed.');
  }

  return parsed.toString();
}

module.exports = { normalizeUrl };
