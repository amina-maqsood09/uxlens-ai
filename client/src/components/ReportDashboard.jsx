import ScoreMeter from './ScoreMeter';
import IssueCard from './IssueCard';

const SEVERITY_ORDER = { critical: 0, major: 1, minor: 2, suggestion: 3 };

const formatTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

/**
 * Renders a structured analysis report as a dashboard:
 * score summary, visual hierarchy, strengths, usability issues,
 * and accessibility notes.
 */
export default function ReportDashboard({ report }) {
  const {
    url,
    title,
    isMock,
    score,
    summary,
    latencyMs,
    analyzedAt,
    visualHierarchy,
    strengths,
    usabilityIssues,
    accessibilityNotes,
  } = report;

  const sortedIssues = [...(usabilityIssues || [])].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  return (
    <div className="report">
      {/* ── Summary header ─────────────────────────────────────────── */}
      <section className="report-header card">
        <div className="report-header-text">
          <div className="report-meta">
            {isMock && <span className="badge badge-sample">Demo data</span>}
            {latencyMs != null && (
              <span className="meta-item">⚡ {(latencyMs / 1000).toFixed(1)}s</span>
            )}
            {analyzedAt && <span className="meta-item">🕐 {formatTime(analyzedAt)}</span>}
          </div>
          <h1 className="report-title">{title || url}</h1>
          <a className="report-url" href={url} target="_blank" rel="noreferrer noopener">
            {url.replace(/^https?:\/\//, '')}
          </a>
        </div>

        <div className="report-score-row">
          <ScoreMeter score={score} label="Overall UX score" />
          <div className="report-summary">
            <h3>Executive summary</h3>
            <p>{summary}</p>
          </div>
        </div>
      </section>

      {/* ── Visual hierarchy ───────────────────────────────────────── */}
      {visualHierarchy && (
        <section className="card vh-card">
          <div className="card-title-row">
            <h2>Visual hierarchy</h2>
            <span className="vh-rating">
              {visualHierarchy.rating != null ? (
                <span className="vh-rating-num">{visualHierarchy.rating}/100</span>
              ) : null}
            </span>
          </div>
          {visualHierarchy.rating != null && (
            <div className="meter-bar" aria-hidden="true">
              <div className="meter-fill" style={{ width: `${visualHierarchy.rating}%` }} />
            </div>
          )}
          <ul className="vh-notes">
            {(visualHierarchy.notes || []).map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Strengths ──────────────────────────────────────────────── */}
      {strengths && strengths.length > 0 && (
        <section className="card strengths-card">
          <h2>What's working well</h2>
          <div className="strength-chips">
            {strengths.map((strength, i) => (
              <span className="chip chip-good" key={i}>
                ✓ {strength}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Usability issues ───────────────────────────────────────── */}
      <section className="card">
        <div className="card-title-row">
          <h2>Usability issues</h2>
          <span className="count-badge">{sortedIssues.length}</span>
        </div>
        {sortedIssues.length === 0 ? (
          <p className="empty-note">No usability issues flagged — looks great!</p>
        ) : (
          <div className="issue-grid">
            {sortedIssues.map((issue, i) => (
              <IssueCard key={i} issue={issue} />
            ))}
          </div>
        )}
      </section>

      {/* ── Accessibility notes ────────────────────────────────────── */}
      <section className="card">
        <div className="card-title-row">
          <h2>Accessibility notes</h2>
          <span className="count-badge">{(accessibilityNotes || []).length}</span>
        </div>
        {!accessibilityNotes || accessibilityNotes.length === 0 ? (
          <p className="empty-note">No accessibility concerns flagged.</p>
        ) : (
          <div className="issue-grid">
            {accessibilityNotes.map((note, i) => (
              <IssueCard key={i} issue={note} kind="accessibility" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
