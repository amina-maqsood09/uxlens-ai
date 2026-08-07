/**
 * Circular score gauge. Color shifts with quality:
 *   ≥80 emerald · ≥60 amber · <60 red.
 */
export default function ScoreMeter({ score, label }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.max(0, Math.min(100, score)) / 100;
  const color =
    score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warn)' : 'var(--danger)';

  return (
    <div className="score-meter" style={{ '--meter-color': color }}>
      <div className="score-ring">
        <svg viewBox="0 0 140 140" aria-hidden="true">
          <circle className="score-track" cx="70" cy="70" r={radius} />
          <circle
            className="score-progress"
            cx="70"
            cy="70"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - percent)}
          />
        </svg>
        <div className="score-value">
          <strong>{score}</strong>
          <span>/100</span>
        </div>
      </div>
      <p className="score-label">{label}</p>
    </div>
  );
}
