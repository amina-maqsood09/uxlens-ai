const STEPS = [
  { icon: '📸', label: 'Capturing screenshot' },
  { icon: '🧠', label: 'Running AI analysis' },
  { icon: '📊', label: 'Compiling your report' },
];

/**
 * Intentional loading state — analysis takes a few seconds (screenshot
 * capture + Gemini call), so we walk through staged steps instead of
 * showing a dead spinner.
 */
export default function LoadingState({ url }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="loading-orb" aria-hidden="true">
          <span />
        </div>
        <h3>Analyzing your site…</h3>
        <p className="loading-url">{url}</p>
        <ol className="loading-steps">
          {STEPS.map((step, i) => (
            <li key={step.label} className="loading-step">
              <span className="loading-step-index">{i + 1}</span>
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
        <p className="loading-hint">This usually takes 10–20 seconds.</p>
      </div>
    </div>
  );
}
