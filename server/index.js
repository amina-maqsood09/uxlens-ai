const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const env = require('./config/env');
const analyzeRouter = require('./routes/analyze');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// --- Middleware -------------------------------------------------------
app.use(cors());
app.use(express.json({ limit: '8mb' })); // room for future screenshot-upload flow

// Simple request logger (only the essentials).
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// --- Routes -----------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mockMode: env.USE_MOCK, model: env.GEMINI_MODEL, uptime: process.uptime() });
});
app.use('/api', analyzeRouter);

// In production, serve the built React app from the same port.
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// --- Errors -----------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`\n  UXLens AI server running`);
  console.log(`  →  http://localhost:${env.PORT}  (mock mode: ${env.USE_MOCK ? 'ON' : 'OFF'})\n`);
});
