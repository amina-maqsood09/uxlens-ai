const puppeteer = require('puppeteer-core');
const { SCREENSHOT_TIMEOUT_MS } = require('../config/env');
const { executablePath } = require('../config/browser');
const { normalizeUrl } = require('../utils/url');
const AppError = require('../utils/appError');

const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 1 };

/**
 * Captures a full-viewport PNG screenshot of a live URL using the system
 * Chrome/Edge via puppeteer-core (no bundled browser download).
 *
 * Handles gracefully: unreachable hosts, TLS errors, pages that hang,
 * and oversized loads — each surfaces as a clear AppError instead of
 * crashing the server.
 *
 * @param {string} rawUrl - URL supplied by the user (may lack a protocol).
 * @returns {Promise<{url: string, title: string, imageBase64: string, mimeType: string}>}
 */
async function captureScreenshot(rawUrl) {
  const url = normalizeUrl(rawUrl);

  if (!executablePath) {
    throw new AppError(
      503,
      'No browser executable found. Install Chrome/Edge or set BROWSER_PATH in .env.'
    );
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--hide-scrollbars',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // Allow sites to render progressively even if they stream content forever.
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: SCREENSHOT_TIMEOUT_MS,
    });

    // Give late-running JS (lazy fonts, hero animations) a beat to settle.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const imageBase64 = await page.screenshot({ type: 'png', encoding: 'base64' });
    const title = await page.title().catch(() => '');

    if (!imageBase64) {
      throw new AppError(502, 'The page loaded but produced an empty screenshot.');
    }

    return {
      url,
      title: title.trim() || url,
      imageBase64,
      mimeType: 'image/png',
    };
  } catch (err) {
    // Puppeteer throws generic TimeoutError / ProtocolError — translate them.
    if (err.name === 'TimeoutError') {
      throw new AppError(504, 'The page took too long to load. Try a faster site or check the URL.');
    }
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      502,
      'Could not load that page. It may be down, blocking bots, or the URL may be invalid.'
    );
  } finally {
    // Always release the browser so we don't leak processes.
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

module.exports = { captureScreenshot };
