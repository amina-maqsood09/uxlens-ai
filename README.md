# UXLens AI

An AI-powered website UX reviewer. Paste a URL, the app captures a screenshot of the live page, sends it to Google Gemini for a structured UX audit, and renders the result as a clean report dashboard — overall score, usability issues (ranked by severity), visual hierarchy feedback, strengths, and accessibility notes.

Built as a capstone/internship demo: a polished, working MVP over exhaustive features.

---

## Tech stack

| Layer    | Tech                                                        |
| -------- | ----------------------------------------------------------- |
| Frontend | React 18 + Vite, `react-hook-form` + `zod` validation       |
| Backend  | Express (Node.js)                                           |
| AI       | Google Gemini (called **only** server-side)                 |
| Capture  | `puppeteer-core` driving a system-installed Chrome/Edge      |
| Styling  | Hand-rolled CSS with light/dark themes (no UI framework)    |

### Why `puppeteer-core`?
UXLens uses your existing Chrome/Edge installation instead of downloading a
bundled Chromium (large, slow, and network-fragile). The server auto-detects
common browser locations on Windows / macOS / Linux, and `BROWSER_PATH` in
`.env` overrides detection.

---

## Getting started

```bash
# 1. Install all workspace dependencies
npm install

# 2. Configure environment
copy .env.example .env        # then fill in GEMINI_API_KEY

# 3. Run server + client together (Vite proxies /api → :3001)
npm run dev
```

- Frontend → http://localhost:5173
- Backend  → http://localhost:3001  (`/api/health` for a health check)

> **No API key yet?** Set `USE_MOCK=true` in `.env`. The analyze route then
> returns a realistic sample report (badged "Demo data") so you can develop and
> demo the full UI without Gemini.

### Manual run
```bash
npm run dev:server   # Express only, port 3001
npm run dev:client   # Vite only, port 5173
npm run build        # production build of the client
npm start            # serve client/dist + API from one server (:3001)
```

---

## Environment variables

| Variable                | Default            | Purpose                                                        |
| ----------------------- | ------------------ | -------------------------------------------------------------- |
| `PORT`                  | `3001`             | Backend port                                                   |
| `GEMINI_API_KEY`        | —                  | Google Gemini key. **Server-side only**, never sent to client. |
| `GEMINI_MODEL`          | `gemini-1.5-flash` | Model used for analysis                                        |
| `USE_MOCK`              | `false`            | `true` → return demo data, skip screenshot + AI calls          |
| `SCREENSHOT_TIMEOUT_MS` | `25000`            | Max wait for a page to load before failing gracefully          |
| `BROWSER_PATH`          | (auto-detected)    | Explicit path to a Chrome/Edge executable                      |

Copy `.env.example` → `.env` and fill in real values. `.env` is gitignored.

---

## Architecture

```
server/
  index.js                 Express app, static client hosting, error wiring
  config/
    env.js                 Central env loading (root + server/.env)
    browser.js             Finds the system Chrome/Edge executable
  routes/
    analyze.js             POST /api/analyze — main entry point (+ mock mode)
  services/
    screenshotCapture.js   puppeteer-core screenshot of a live URL
    geminiService.js       Gemini call + prompt + JSON schema (one file)
  middleware/
    errorHandler.js        Central 404 / error responses
  utils/
    url.js                 URL normalization + validation
    appError.js            HTTP-status-carrying error type

client/
  src/
    components/            UrlInputForm, ReportDashboard, ScoreMeter,
                           IssueCard, LoadingState, Testimonials, Navbar, Footer
    context/               AnalysisContext (status + latest report)
    hooks/                 useTheme (light/dark)
    pages/                 Home, Results
    services/api.js        Fetch wrapper — the ONLY way the client talks to
                           the backend (never Gemini directly)
```

### Request flow

```
User submits URL
  → POST /api/analyze { url }
  → normalizeUrl() validates + adds https://
  → captureScreenshot() loads the page headlessly, returns base64 PNG
  → analyzeScreenshot() sends image + prompt to Gemini,
      forces JSON via responseMimeType + schema, validates/normalizes it
  → structured report JSON  →  ReportDashboard UI
```

### AI output schema (enforced in `geminiService.js`)

```json
{
  "score": 78,
  "summary": "…",
  "visualHierarchy": { "rating": 81, "notes": ["…"] },
  "strengths": ["…"],
  "usabilityIssues": [
    { "title": "…", "severity": "critical|major|minor|suggestion",
      "description": "…", "suggestion": "…" }
  ],
  "accessibilityNotes": [
    { "title": "…", "severity": "critical|major|minor",
      "description": "…", "suggestion": "…" }
  ]
}
```

The response is parsed (including fenced-```json tolerance), validated, and
every field is defaulted so the UI never crashes on odd AI output.

### Error handling

- Invalid / non-http(s) URLs → `400` with a clear message (also caught client-side by zod).
- Unreachable, slow, or bot-blocking pages → `502/504` from Puppeteer's error translation.
- Missing API key / Gemini outage / unparseable JSON → friendly `503/502` responses.
- The frontend renders these in a retry panel, never a white screen.

---

## Demo tips

- **Mock mode first**: `USE_MOCK=true` makes the full flow instant and reliable for walk-throughs.
- **Good live URLs to try**: a marketing page, a SaaS landing page, a docs site. Avoid URLs that require login.
- Sample quotes on the landing page and demo reports carry a **"Sample"** badge so they're clearly not real user data.

## Security notes

- `GEMINI_API_KEY` lives in `.env` and is read only in `server/`. Nothing in `client/` references it.
- CORS is enabled for dev (Vite origin); in production the built client is served by the same Express app.
- SSRF is limited by accepting only `http(s)://` URLs for Puppeteer.

## Possible next steps (stretch goals)

- User accounts (`AuthContext` + session tokens) and saved report history
- Screenshot/image upload as an alternative to URL input
- Side-by-side comparison of two URLs
- PDF export of a report
- Re-analyze-on-a-schedule for a historical trend view
