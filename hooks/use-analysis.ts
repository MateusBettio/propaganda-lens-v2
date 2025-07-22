import { useState, useCallback } from 'react';
import { analyzeContent } from '../services/api';
import { AnalysisResult } from '../types';

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = useCallback(async (content: string, type: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const analysis = await analyzeContent(content, type);
      setResult(analysis);
      return analysis;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { analyze, loading, error, result, reset };
}