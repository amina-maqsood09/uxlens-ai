import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAnalysis, ANALYSIS_STATUS } from '../context/AnalysisContext';
import LoadingState from '../components/LoadingState';
import ReportDashboard from '../components/ReportDashboard';
import UrlInputForm from '../components/UrlInputForm';
import ChatPanel from '../components/ChatPanel';

/**
 * Results page — renders whatever state the analysis is in:
 * loading → LoadingState, error → retry panel, done → ReportDashboard.
 * Direct visits without an analysis are redirected home.
 */
export default function Results() {
  const navigate = useNavigate();
  const { status, result, error, lastUrl, runAnalysis } = useAnalysis();

  // If someone lands here without starting an analysis, send them home.
  useEffect(() => {
    if (status === ANALYSIS_STATUS.IDLE) navigate('/');
  }, [status, navigate]);

  if (status === ANALYSIS_STATUS.LOADING) {
    return (
      <section className="container section">
        <LoadingState url={lastUrl} />
      </section>
    );
  }

  if (status === ANALYSIS_STATUS.ERROR) {
    return (
      <section className="container section">
        <div className="error-panel card">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <h2>We couldn&rsquo;t complete the analysis</h2>
          <p className="error-message">{error}</p>
          <p className="error-hint">
            Check that the URL is public and reachable, then try again.
          </p>
          <div className="error-actions">
            <button type="button" className="btn btn-primary" onClick={() => runAnalysis(lastUrl)}>
              ↻ Retry
            </button>
            <Link to="/" className="btn btn-ghost">
              Analyze a different URL
            </Link>
          </div>
          <div className="error-retry-form">
            <UrlInputForm onSubmit={(url) => runAnalysis(url)} busy={false} />
          </div>
        </div>
      </section>
    );
  }

  if (status === ANALYSIS_STATUS.DONE && result) {
    return (
      <section className="container section">
        <div className="results-topbar">
          <h2>Analysis report</h2>
          <Link to="/" className="btn btn-ghost">
            ← Analyze another URL
          </Link>
        </div>
        <ReportDashboard report={result} />
        <ChatPanel report={result} />
      </section>
    );
  }

  return null;
}


