import { AnalysisResult } from '../types';
import { analyzeTwitterContent } from './twitter-analyzer';
import { analyzeDirectContent } from './direct-analyzer';
import { handleAnalysisError } from './error-handler';

export async function analyzeContent(content: string, type: string): Promise<AnalysisResult> {
  try {
    console.log('=== EXTRACTION QUEUE REQUEST ===');
    console.log('URL:', content);
    console.log('Content type:', type);

    const isTwitterUrl = /(?:twitter\.com|x\.com)/i.test(content);
    
    console.log('🔍 URL analysis:', content);
    console.log('🔍 Is Twitter URL?', isTwitterUrl);
    
    if (isTwitterUrl) {
      return await analyzeTwitterContent(content);
    } else {
      return await analyzeDirectContent(content, type);
    }
  } catch (error) {
    throw handleAnalysisError(error);
  }
}