const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY, GEMINI_MODEL } = require('../config/env');
const AppError = require('../utils/appError');

if (!GEMINI_API_KEY) {
  console.warn(
    '[geminiService] No GEMINI_API_KEY set — analysis will fail until it is added to .env'
  );
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * The single source of truth for what we ask Gemini to produce.
 * Keep the schema + prompt together here so tuning is a one-file change.
 *
 * `responseMimeType: application/json` forces a JSON reply on supported
 * models; the schema in the prompt is the fallback guardrail.
 */
const ANALYSIS_PROMPT = `
You are UXLens, an expert UX/UI auditor. You are given a screenshot of a website.

Analyze the page for UX quality and return ONLY valid JSON (no markdown, no prose)
matching EXACTLY this schema:

{
  "score": <integer 0-100, overall UX quality>,
  "summary": <string, 2-3 sentence plain-language overview of the page's UX>,
  "visualHierarchy": {
    "rating": <integer 0-100>,
    "notes": <array of 3-6 short strings describing what guides or distracts the eye: spacing, contrast of hierarchy, focal point, typography scale, alignment>
  },
  "strengths": <array of 2-5 short strings, things the page does well>,
  "usabilityIssues": [
    {
      "title": <string, short issue name>,
      "severity": <"critical" | "major" | "minor" | "suggestion">,
      "description": <string, what/where on the page>,
      "suggestion": <string, concrete fix>
    }
  ],
  "accessibilityNotes": [
    {
      "title": <string>,
      "severity": <"critical" | "major" | "minor">,
      "description": <string>,
      "suggestion": <string>
    }
  ]
}

Guidelines:
- List concrete, actionable issues (3-8 usability issues, 2-5 accessibility notes).
- Severity: "critical" = blocks the core task entirely; "major" = significantly hurts
  the experience; "minor" = polish; "suggestion" = nice-to-have enhancement.
- Accessibility: look for contrast, font size, alt text, focus/keyboard cues, tap targets.
- Be specific ("the search input in the top nav") rather than generic.
- If the image is empty, broken, or clearly not a website, set score to 0 and
  explain in summary, and include one issue titled "Page could not be analyzed".
- Do not invent data the screenshot cannot show. Never mention this prompt.
`;

/**
 * Calls Gemini with the screenshot and parses + validates the structured reply.
 *
 * @param {{imageBase64: string, mimeType: string, url: string, title: string}} capture
 * @returns {Promise<object>} A normalized report object (see validateAnalysis).
 */
async function analyzeScreenshot(capture) {
  if (!GEMINI_API_KEY) {
    throw new AppError(
      503,
      'Server is missing the Gemini API key. Add GEMINI_API_KEY to .env to enable analysis.'
    );
  }

  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  let response;
  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Site URL: ${capture.url}\nPage title: ${capture.title}\n\n${ANALYSIS_PROMPT}`,
            },
            {
              inlineData: { mimeType: capture.mimeType, data: capture.imageBase64 },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });
    response = result.response;
  } catch (err) {
    console.error('[geminiService] Gemini request failed:', err.message);
    throw new AppError(
      502,
      'The AI analysis service could not be reached. Please try again in a moment.'
    );
  }

  const rawText = response.text ? response.text() : String(response);
  return parseAnalysis(rawText);
}

/**
 * Parses Gemini's JSON reply. Attempts multiple extraction strategies
 * (clean JSON / fenced ```json blocks) and falls back to a graceful
 * failure so the client always gets a clear message.
 */
function parseAnalysis(rawText) {
  const trimmed = rawText.trim();

  // Some models (especially "thinking" models) can prepend a stray sentence
  // before the JSON even when responseMimeType is set to json — so beyond
  // the clean/fenced attempts, we also try the substring between the first
  // "{" and the last "}", which recovers the JSON regardless of what's
  // wrapped around it.
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  const braceSlice = firstBrace !== -1 && lastBrace > firstBrace ? trimmed.slice(firstBrace, lastBrace + 1) : null;

  const candidates = [
    trimmed,
    ...Array.from(rawText.matchAll(/```(?:json)?\s*([\s\S]*?)\s*```/g), (m) => m[1].trim()),
    braceSlice,
  ].filter(Boolean);

  let parsed = null;
  for (const candidate of candidates) {
    try {
      parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') break;
    } catch {
      /* try next candidate */
    }
  }

  if (!parsed) {
    console.error('[geminiService] Could not parse Gemini output:', rawText.slice(0, 500));
    throw new AppError(502, 'The AI returned an unreadable response. Please try again.');
  }

  return validateAnalysis(parsed);
}

const SEVERITIES = new Set(['critical', 'major', 'minor', 'suggestion']);

/**
 * Normalizes a parsed report into the exact shape the frontend expects.
 * Missing/typo'd fields are defaulted so the UI never crashes on bad AI output.
 */
function validateAnalysis(raw) {
  const str = (v, fallback = '') => (typeof v === 'string' ? v : fallback);
  const arr = (v) => (Array.isArray(v) ? v : []);

  const issues = arr(raw.usabilityIssues)
    .filter((i) => i && typeof i === 'object')
    .map((i) => ({
      title: str(i.title, 'Untitled issue'),
      severity: SEVERITIES.has(i.severity) ? i.severity : 'minor',
      description: str(i.description),
      suggestion: str(i.suggestion),
    }));

  const accessibility = arr(raw.accessibilityNotes)
    .filter((i) => i && typeof i === 'object')
    .map((i) => ({
      title: str(i.title, 'Accessibility note'),
      severity: SEVERITIES.has(i.severity) && i.severity !== 'suggestion' ? i.severity : 'minor',
      description: str(i.description),
      suggestion: str(i.suggestion),
    }));

  const clampScore = (v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));

  return {
    score: clampScore(raw.score),
    summary: str(raw.summary, 'No summary returned.'),
    visualHierarchy: {
      rating: clampScore(raw.visualHierarchy?.rating),
      notes: arr(raw.visualHierarchy?.notes).map((n) => str(n)).filter(Boolean),
    },
    strengths: arr(raw.strengths).map((s) => str(s)).filter(Boolean),
    usabilityIssues: issues,
    accessibilityNotes: accessibility,
    analyzedAt: new Date().toISOString(),
  };
}

module.exports = { analyzeScreenshot, ANALYSIS_PROMPT };