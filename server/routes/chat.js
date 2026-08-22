const express = require('express');
const router = express.Router();

const { streamChatReply } = require('../services/chatService');

/**
 * POST /api/chat
 * Body: { message: string, history: {role: 'user'|'assistant', content: string}[], report: object }
 *
 * Streams the AI reply as Server-Sent Events, one JSON payload per line:
 *   data: {"type":"delta","text":"..."}\n\n    → one per chunk of text
 *   data: {"type":"done"}\n\n                   → stream finished normally
 *   data: {"type":"error","message":"..."}\n\n  → stream failed
 *
 * The client is expected to send the FULL conversation history each turn
 * (this route is stateless) — see useChatStream.js on the client.
 *
 * If the client aborts (stop button, or navigates away), the request's
 * 'close' event fires below and cancels the in-flight Gemini call via
 * AbortSignal, so we don't keep burning tokens after the user has stopped.
 */
router.post('/chat', async (req, res) => {
    const { message, history, report } = req.body || {};

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'A "message" string is required.' });
    }

    // SSE headers must go out before any data. X-Accel-Buffering disables
    // proxy-level buffering on platforms like Render/nginx so chunks aren't
    // held back until the response ends.
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
    });

    const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

    const controller = new AbortController();
    // NOTE: req.on('close') fires as soon as the request body finishes being
    // read — not when the client actually disconnects — which was aborting
    // every request before Gemini was even called. res.on('close') is the
    // correct event: it only fires when the response stream itself closes
    // (client navigated away / hit stop before we finished responding).
    res.on('close', () => controller.abort());

    const fullHistory = [
        ...(Array.isArray(history) ? history : []),
        { role: 'user', content: message },
    ];

    try {
        await streamChatReply(
            { report, history: fullHistory, signal: controller.signal },
            (text) => send({ type: 'delta', text })
        );
        if (!controller.signal.aborted) {
            send({ type: 'done' });
        }
    } catch (err) {
        console.error('[chat route]', err.message);
        send({ type: 'error', message: err.expose ? err.message : 'Something went wrong. Please try again.' });
    } finally {
        res.end();
    }
});

module.exports = router;