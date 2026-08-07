const path = require('path');

// Load .env from the current working directory first (e.g. server/.env),
// then fall back to the project root so one shared .env works.
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../..', '.env') });

const env = {
  PORT: Number(process.env.PORT) || 3001,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  USE_MOCK: process.env.USE_MOCK === 'true',
  SCREENSHOT_TIMEOUT_MS: Number(process.env.SCREENSHOT_TIMEOUT_MS) || 25000,
};

module.exports = env;
