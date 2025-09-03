import { supabase } from '../lib/supabase';
import { AnalysisResult } from '../types';

// Simplified API - single endpoint for all content analysis
export async function analyzeContent(content: string): Promise<AnalysisResult> {
  try {
    console.log('=== SIMPLIFIED API CALL ===');
    console.log('Content:', content.substring(0, 100) + '...');

    // Single call to simplified analyze endpoint
    const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze', {
      body: { content: content },
    });

    if (analysisError) {
      console.error('Analyze function error:', analysisError);
      throw new Error(`Analysis failed: ${analysisError.message}`);
    }

    console.log('=== ANALYSIS SUCCESS ===');
    
    // Return the analysis result directly
    return {
      techniques: analysisData.techniques || [],
      manipulationScore: 0, // Not used anymore
      quickAssessment: analysisData.quickAssessment || '',
      counterPerspective: analysisData.counterPerspective || '',
      reflectionQuestions: analysisData.reflectionQuestions || [],
      sourceInfo: analysisData.sourceInfo || {
        sourceUrl: content.startsWith('http') ? content : undefined,
        contentType: 'text',
      },
      language: analysisData.language || 'en',
      languageConfidence: analysisData.languageConfidence || 0.5,
    };
    
  } catch (error) {
    console.error('Analysis failed:', error);
    
    // Simplified error handling
    if (error instanceof Error) {
      // Generic error with more context
      throw new Error(`❌ Analysis Error - ${error.message}. Please try again.`);
    }
    
    throw new Error('❌ Unknown Error - Something went wrong during analysis. Please try again.');
  }
}