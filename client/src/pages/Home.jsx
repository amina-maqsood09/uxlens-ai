import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../context/AnalysisContext';
import UrlInputForm from '../components/UrlInputForm';
import Testimonials from '../components/Testimonials';

const FEATURES = [
  {
    icon: '🖼️',
    title: 'Analyzes the real page',
    text: 'We capture an actual screenshot of your site — the AI reviews what your visitors see, not just your markup.',
  },
  {
    icon: '🎯',
    title: 'Actionable, prioritized fixes',
    text: 'Findings come back as a ranked issue list with severity, what\u2019s wrong, and a concrete suggestion for each.',
  },
  {
    icon: '♿',
    title: 'Accessibility built in',
    text: 'Contrast, font size, keyboard cues and tap targets are checked as part of every report.',
  },
  {
    icon: '📈',
    title: 'A clear, shareable score',
    text: 'One overall UX score plus a visual hierarchy rating so you can track improvement over time.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Paste a URL',
    text: 'Any public web page — a landing page, an app, even a checkout flow.',
  },
  {
    num: '02',
    title: 'We screenshot & analyze',
    text: 'The backend captures the page and sends it to Google Gemini for a structured UX review.',
  },
  {
    num: '03',
    title: 'Get your report',
    text: 'A score, usability issues, visual hierarchy notes and accessibility feedback — all in one dashboard.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { runAnalysis, status } = useAnalysis();
  const busy = status === 'loading';

  const handleSubmit = (url) => {
    runAnalysis(url);
    navigate('/results');
  };

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">AI-powered UX auditing</span>
          <h1>
            See your website through
            <br />
            <span className="gradient-text">expert eyes.</span>
          </h1>
          <p className="hero-sub">
            UXLens AI captures your page, analyzes it with Google Gemini, and returns a
            clear, actionable UX report — score, usability issues, visual hierarchy
            feedback and accessibility notes.
          </p>

          <div className="hero-form">
            <UrlInputForm onSubmit={handleSubmit} busy={busy} />
            <p className="hero-note">
              Free to try · Screenshot captured live · Takes ~15 seconds
            </p>
          </div>

          <div className="hero-stats">
            <span><strong>4</strong> report sections</span>
            <span><strong>100</strong> possible score</span>
            <span><strong>0</strong> install required</span>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>Three steps to a better website</h2>
          </div>
          <div className="steps-grid">
            {STEPS.map((step) => (
              <div className="step-card card" key={step.num}>
                <span className="step-num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="section section-alt" id="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Features</span>
            <h2>Everything a UX review should tell you</h2>
          </div>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div className="feature-card card" key={f.title}>
                <span className="feature-icon" aria-hidden="true">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials (demo content) ──────────────────────────── */}
      <Testimonials />

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to put your site under the lens?</h2>
            <p>Paste a URL above and get your first UX report in seconds.</p>
          </div>
        </div>
      </section>
    </>
  );
}
