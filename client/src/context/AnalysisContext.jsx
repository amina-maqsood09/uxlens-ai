import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { analyzeUrl } from '../services/api';

const AnalysisContext = createContext(null);

export const ANALYSIS_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  DONE: 'done',
};

/**
 * Holds the current analysis lifecycle (idle → loading → error/done) and
 * the latest report. Home triggers runAnalysis(), Results renders the outcome.
 */
export function AnalysisProvider({ children }) {
  const [status, setStatus] = useState(ANALYSIS_STATUS.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [lastUrl, setLastUrl] = useState('');

  const runAnalysis = useCallback(async (url) => {
    setStatus(ANALYSIS_STATUS.LOADING);
    setError(null);
    setLastUrl(url);
    try {
      const data = await analyzeUrl(url);
      setResult(data);
      setStatus(ANALYSIS_STATUS.DONE);
    } catch (err) {
      setError(err.message);
      setResult(null);
      setStatus(ANALYSIS_STATUS.ERROR);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus(ANALYSIS_STATUS.IDLE);
    setResult(null);
    setError(null);
    setLastUrl('');
  }, []);

  const value = useMemo(
    () => ({ status, result, error, lastUrl, runAnalysis, reset }),
    [status, result, error, lastUrl, runAnalysis, reset]
  );

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error('useAnalysis must be used within <AnalysisProvider>');
  return ctx;
}
