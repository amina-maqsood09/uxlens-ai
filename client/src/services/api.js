const API_BASE = '/api';

/**
 * Thin wrapper around fetch. All backend calls go through here —
 * the frontend NEVER talks to Gemini directly.
 */
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.error || 'Something went wrong. Please try again.';
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

/** POST /api/analyze — asks the backend to screenshot + analyze a URL. */
export function analyzeUrl(url) {
  return request('/analyze', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

/** GET /api/health — lightweight server check. */
export function healthCheck() {
  return request('/health');
}
