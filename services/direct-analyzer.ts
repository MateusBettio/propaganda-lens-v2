import { supabase } from '../lib/supabase';
import { AnalysisResult } from '../types';

export async function analyzeDirectContent(content: string, type: string): Promise<AnalysisResult> {
  console.log('🌐 Non-Twitter URL - using direct analysis');
  
  const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze', {
    body: { content: content },
  });

  if (analysisError) {
    console.error('Analyze function error:', analysisError);
    throw new Error(`Analysis failed: ${analysisError.message}`);
  }

  console.log('=== ANALYSIS SUCCESS ===');
  
  return {
    techniques: analysisData.techniques || [],
    manipulationScore: 0,
    quickAssessment: analysisData.quickAssessment || '',
    counterPerspective: analysisData.counterPerspective || '',
    reflectionQuestions: analysisData.reflectionQuestions || [],
    sourceInfo: analysisData.sourceInfo || {
      sourceUrl: content,
      contentType: type,
    },
    language: analysisData.language || 'en',
    languageConfidence: analysisData.languageConfidence || 0.5,
    extractionFlow: analysisData.extractionFlow,
  };
}