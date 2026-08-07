const fs = require('fs');

/**
 * Resolves a usable Chromium-based browser executable.
 *
 * UXLens uses `puppeteer-core` (no bundled browser download), so it needs a
 * system browser. We check common Chrome / Edge locations across platforms and
 * let an explicit BROWSER_PATH env var override everything.
 */
function resolveBrowserExecutable() {
  const explicit = process.env.BROWSER_PATH;
  if (explicit && fs.existsSync(explicit)) return explicit;

  const candidates = [
    // Windows — Chrome & Edge
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.LOCALAPPDATA && `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

const executablePath = resolveBrowserExecutable();

if (!executablePath) {
  console.warn(
    '[browser] No Chrome/Edge found. Set BROWSER_PATH in .env to a chromium executable.'
  );
}

module.exports = { executablePath, resolveBrowserExecutable };
