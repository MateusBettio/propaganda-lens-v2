import { useState, useCallback } from 'react';
import { analyzeContent } from '../services/api';
import { AnalysisResult } from '../types';

// Simplified analysis hook - no platform detection, no queue polling
export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Simplified analyze function - just takes content, no type parameter needed
  const analyze = useCallback(async (content: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting simplified analysis for:', content.substring(0, 50) + '...');
      
      // Single API call - no platform-specific logic
      const analysis = await analyzeContent(content);
      
      setResult(analysis);
      console.log('Analysis completed successfully');
      return analysis;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      console.error('Analysis failed:', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { analyze, loading, error, result, reset, clearError };
}