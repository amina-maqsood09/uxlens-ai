const express = require('express');
const router = express.Router();

const { normalizeUrl } = require('../utils/url');
const { captureScreenshot } = require('../services/screenshotCapture');
const { analyzeScreenshot } = require('../services/geminiService');
const { USE_MOCK } = require('../config/env');

/**
 * POST /api/analyze
 * Body: { url: string }
 *
 * Flow: normalize URL → screenshot it (Puppeteer) → send the image to
 * Gemini → return a validated structured report.
 *
 * When USE_MOCK=true (env), returns realistic demo data so the frontend
 * can be developed/demoed without an API key.
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { url } = req.body || {};
    const normalized = normalizeUrl(url);
    const startedAt = Date.now();

    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 2500)); // simulate capture + AI latency
      return res.json({
        isMock: true,
        ...mockReport(normalized),
        analyzedAt: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
      });
    }

    const capture = await captureScreenshot(normalized);
    const analysis = await analyzeScreenshot(capture);

    res.json({
      isMock: false,
      url: capture.url,
      title: capture.title,
      ...analysis,
      latencyMs: Date.now() - startedAt,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Realistic sample report used when USE_MOCK=true or for manual testing.
 * Clearly flagged isMock:true so the UI can show a "Demo data" badge.
 */
function mockReport(url) {
  return {
    url,
    title: 'Demo Report',
    score: 78,
    summary:
      'Overall this page has a solid, modern layout with a clear focal point and good use of whitespace. The primary call-to-action is prominent, but navigation labeling is inconsistent and several controls have low contrast. A handful of fixes around hierarchy and accessibility would move this from good to great.',
    visualHierarchy: {
      rating: 81,
      notes: [
        'The hero headline clearly anchors the page — strong scale contrast draws the eye immediately.',
        'Primary CTA uses a bold accent color that stands out against the neutral background.',
        'Card content below the fold has consistent spacing and alignment.',
        'Footer links sit too close together, which slightly flattens the visual rhythm.',
        'Typography scale is good overall, though body text is on the smaller side.',
      ],
    },
    strengths: [
      'Clear, descriptive page title and immediate value proposition.',
      'Logical reading order with a strong visual focal point.',
      'Consistent card layout with generous whitespace.',
      'Smooth scrolling and subtle micro-interactions that feel polished.',
    ],
    usabilityIssues: [
      {
        title: 'Inconsistent navigation labels',
        severity: 'major',
        description:
          'The top nav mixes "Products" and "Solutions" for what appears to be the same section, and the active page is not visually indicated.',
        suggestion:
          'Unify the labels into one term, and add a persistent active/underline state to the current nav item.',
      },
      {
        title: 'Search input lacks a visible label',
        severity: 'minor',
        description:
          'The search box in the header is icon-only until hover, so its purpose is ambiguous.',
        suggestion:
          'Add a placeholder like "Search the docs…" and a visible magnifier icon at all times.',
      },
      {
        title: 'No explicit empty state for the pricing table',
        severity: 'minor',
        description:
          'When a user filters to a plan with no matching features, the table simply disappears without feedback.',
        suggestion: 'Show an empty-state message and a "Clear filters" action.',
      },
      {
        title: 'Low-contrast links inside the hero paragraph',
        severity: 'major',
        description:
          'Inline text links in the hero use a light gray that fails to meet AA contrast against white.',
        suggestion: 'Use the primary accent color at its darker shade for inline links.',
      },
      {
        title: 'Consider a "Skip to content" affordance',
        severity: 'suggestion',
        description:
          'Power users and keyboard navigators must tab through the full nav before reaching content.',
        suggestion: 'Add a skip-link that appears on first keyboard focus.',
      },
    ],
    accessibilityNotes: [
      {
        title: 'Contrast below AA on secondary text',
        severity: 'major',
        description:
          'Muted gray captions under feature cards measure ~3.8:1 contrast ratio against the background.',
        suggestion: 'Darken muted text colors to reach at least 4.5:1.',
      },
      {
        title: 'Body font size below 16px',
        severity: 'minor',
        description: 'Body copy is set at 14px, which is small for comfortable reading on mobile.',
        suggestion: 'Raise base body text to 16px and let the type scale breathe.',
      },
      {
        title: 'Interactive cards are not focusable',
        severity: 'minor',
        description: 'Whole-card click areas rely on a parent onClick, but no tabindex is set.',
        suggestion: 'Make cards keyboard-accessible with a visible focus outline.',
      },
      {
        title: 'Some decorative icons lack aria-hidden',
        severity: 'minor',
        description:
          'Decorative SVGs in the hero are announced by screen readers, adding noise.',
        suggestion: 'Add aria-hidden="true" and focusable="false" to decorative icons.',
      },
    ],
  };
}

module.exports = router;
