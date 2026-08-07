import SeverityBadge from './SeverityBadge';

/**
 * A single finding — used for both usability issues and accessibility notes.
 * Shows severity, a short title, what's wrong, and a concrete suggestion.
 */
export default function IssueCard({ issue, kind = 'usability' }) {
  const { title, description, suggestion } = issue;

  return (
    <article className={`issue-card issue-card-${kind}`}>
      <div className="issue-head">
        <SeverityBadge severity={issue.severity} />
        <h4>{title}</h4>
      </div>
      <p className="issue-desc">{description}</p>
      {suggestion && (
        <div className="issue-suggestion">
          <span className="issue-suggestion-label">Suggestion</span>
          <p>{suggestion}</p>
        </div>
      )}
    </article>
  );
}
