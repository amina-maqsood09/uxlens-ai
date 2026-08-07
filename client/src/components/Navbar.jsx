import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="22" height="22">
              <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#brand-grad)" />
              <circle cx="23" cy="24" r="9" fill="none" stroke="#fff" strokeWidth="4.5" />
              <path d="M30 30 L45 45" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M14 47 L34 47" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
              <defs>
                <linearGradient id="brand-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#6153f6" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="brand-name">
            UXLens <em>AI</em>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main">
          <Link to="/">Home</Link>
          <a href="/#how-it-works">How it works</a>
          <a href="/#features">Features</a>
        </nav>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20.4 14.2A8.5 8.5 0 0 1 9.8 3.6 8.5 8.5 0 1 0 20.4 14.2z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
