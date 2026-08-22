import { useCallback, useRef, useState } from 'react';

const API_BASE = '/api';

/**
 * Custom streaming-chat hook — plays the same role as the AI SDK's
 * useChat(), built by hand against our own /api/chat SSE endpoint.
 *
 * Status flow: 'idle' -> 'thinking' (waiting for first token)
 *              -> 'streaming' (tokens arriving) -> 'idle'
 * 'error' is set on failure; 'idle' after a manual stop.
 *
 * @param {{ report: object }} params - the analyzed report, sent as
 *   grounding context with every message.
 */
export function useChatStream({ report }) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | thinking | streaming | error
  const abortRef = useRef(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || status === 'thinking' || status === 'streaming') return;

      // History sent to the server excludes the message we're about to add —
      // the server appends it server-side (see routes/chat.js).
      const history = messages.map(({ role, content }) => ({ role, content }));

      const userMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed };
      const assistantId = crypto.randomUUID();

      setMessages((prev) => [...prev, userMessage, { id: assistantId, role: 'assistant', content: '' }]);
      setStatus('thinking');

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, history, report }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error('Chat request failed. Please try again.');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop(); // last chunk may be incomplete — keep for next read

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = JSON.parse(line.slice(6));

            if (payload.type === 'delta') {
              setStatus('streaming');
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + payload.text } : m))
              );
            } else if (payload.type === 'error') {
              throw new Error(payload.message);
            }
            // 'done' needs no action — the loop just ends naturally.
          }
        }

        setStatus('idle');
      } catch (err) {
        if (err.name === 'AbortError') {
          // Manual stop: keep whatever partial text has streamed in, just
          // return to idle so the user can send another message right away.
          setStatus('idle');
        } else {
          console.error('[useChatStream]', err.message);
          setStatus('error');
        }
      } finally {
        abortRef.current = null;
      }
    },
    [messages, report, status]
  );

  return { messages, status, sendMessage, stop };
}