const SEVERITY_LABELS = {
  critical: 'Critical',
  major: 'Major',
  minor: 'Minor',
  suggestion: 'Suggestion',
};

export default function SeverityBadge({ severity }) {
  const level = severity || 'minor';
  return (
    <span className={`badge badge-${level}`}>{SEVERITY_LABELS[level] || 'Minor'}</span>
  );
}
