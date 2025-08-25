import { supabase } from '../lib/supabase';
import { AnalysisResult } from '../types';
import { transformBackendResponse } from './transformers';

export async function analyzeTwitterContent(content: string): Promise<AnalysisResult> {
  console.log('🐦 Twitter URL detected - using extraction queue');
  
  const { data: extractData, error: extractError } = await supabase.functions.invoke('extract', {
    body: { url: content },
  });

  if (extractError) {
    console.error('Extract function error:', extractError);
    throw new Error(`Extraction failed: ${extractError.message}`);
  }

  console.log('✅ Job queued:', extractData);
  const jobId = extractData.job_id;

  console.log('🔄 Triggering worker...');
  const { data: workerData, error: workerError } = await supabase.functions.invoke('worker', {
    body: {},
  });

  if (workerError) {
    console.warn('Worker trigger warning:', workerError);
  }

  return await pollForResults(content);
}

async function pollForResults(content: string): Promise<AnalysisResult> {
  console.log('⏳ Polling for results...');
  const maxAttempts = 30;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: result, error: resultError } = await supabase
      .from('analysis')
      .select('*')
      .eq('url', content)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!resultError && result) {
      console.log('✅ Analysis complete:', result);
      return transformBackendResponse(result, content);
    }

    attempts++;
  }

  throw new Error('Analysis timeout - please try again');
}