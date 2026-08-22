import { useEffect, useRef, useState } from 'react';
import { useChatStream } from '../hooks/useChatStream';

// "Close enough" to the bottom (px) that we keep auto-scrolling as new
// text streams in. Once the user scrolls past this, we back off.
const SCROLL_BOTTOM_THRESHOLD = 80;

/**
 * Chat panel for asking follow-up questions about an analyzed report.
 * Rendered below ReportDashboard on the Results page — see Results.jsx.
 */
export default function ChatPanel({ report }) {
    const { messages, status, sendMessage, stop } = useChatStream({ report });
    const [input, setInput] = useState('');
    const [isAtBottom, setIsAtBottom] = useState(true);
    const scrollRef = useRef(null);
    const bottomRef = useRef(null);

    const isBusy = status === 'thinking' || status === 'streaming';

    // Auto-scroll only while the user is already near the bottom — the
    // moment they scroll up to re-read something, we stop pulling them back.
    useEffect(() => {
        if (isAtBottom) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages, isAtBottom]);

    function handleScroll() {
        const el = scrollRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setIsAtBottom(distanceFromBottom < SCROLL_BOTTOM_THRESHOLD);
    }

    function jumpToLatest() {
        setIsAtBottom(true);
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!input.trim() || isBusy) return;
        sendMessage(input);
        setInput('');
    }

    return (
        <section className="chat-panel" aria-label="Ask AI about this report">
            <div className="chat-panel-head">
                <h3>Ask about this report</h3>
                <p className="chat-panel-sub">
                    Grounded in the analysis above — ask for fixes, priorities, or clarification.
                </p>
            </div>

            <div className="chat-scroll" ref={scrollRef} onScroll={handleScroll}>
                {messages.length === 0 && (
                    <p className="chat-empty">
                        Try: &ldquo;What should I fix first?&rdquo; or &ldquo;Give me CSS for the contrast issue.&rdquo;
                    </p>
                )}

                {messages.map((m) => (
                    <div key={m.id} className={`chat-bubble chat-bubble-${m.role}`}>
                        {m.role === 'assistant' && m.content === '' && status === 'thinking' ? (
                            // Thinking indicator hands off into text the instant the first
                            // token lands — same bubble, no flash/swap between the two.
                            <span className="chat-thinking" aria-live="polite" aria-label="AI is thinking">
                                <span className="chat-dot" />
                                <span className="chat-dot" />
                                <span className="chat-dot" />
                            </span>
                        ) : (
                            <p>{m.content}</p>
                        )}
                    </div>
                ))}

                <div ref={bottomRef} />
            </div>

            {!isAtBottom && (
                <button type="button" className="chat-jump-btn" onClick={jumpToLatest}>
                    ↓ Jump to latest
                </button>
            )}

            {status === 'error' && (
                <p className="chat-error">Something went wrong. Please try sending your message again.</p>
            )}

            <form className="chat-input-row" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about this report…"
                    disabled={isBusy}
                    aria-label="Chat message"
                />
                {isBusy ? (
                    <button type="button" className="chat-stop-btn" onClick={stop}>
                        Stop
                    </button>
                ) : (
                    <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
                        Send
                    </button>
                )}
            </form>
        </section>
    );
}