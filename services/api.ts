import { supabase } from '../lib/supabase';
import { AnalysisResult } from '../types';

// Transform backend response to frontend format
function transformBackendResponse(backendData: any, originalUrl: string): AnalysisResult {
  // Parse the summary field which contains the actual analysis
  const summary = backendData.summary || '';
  
  // Extract techniques from the analysis text (simplified parsing)
  const techniques = extractTechniquesFromAnalysis(summary, backendData.language || 'en');
  
  return {
    techniques,
    manipulationScore: Math.round((backendData.confidence || 0.5) * 100),
    quickAssessment: summary,
    counterPerspective: '', // TODO: Add counter perspective extraction
    reflectionQuestions: [], // TODO: Add reflection questions extraction
    sourceInfo: {
      sourceUrl: originalUrl,
      contentType: backendData.sourceMetadata?.platform || 'web',
      extractedData: {
        type: backendData.sourceMetadata?.platform || 'web',
        title: extractTitleFromContent(backendData.content || ''),
      }
    },
    // New multilingual fields
    language: backendData.language || 'en',
    languageConfidence: backendData.language_confidence || 0.5,
    content: backendData.content,
    summary: summary,
    indicators: backendData.indicators,
    confidence: backendData.confidence,
    sourceMetadata: backendData.sourceMetadata,
  };
}

// Extract techniques from analysis text (simple parsing)
function extractTechniquesFromAnalysis(analysis: string, language: string) {
  // This is a simplified version - in production you'd want more sophisticated parsing
  const techniques = [
    {
      name: getLocalizedString('content_analysis', language),
      description: analysis.substring(0, 200) + '...',
      confidence: 'medium' as const,
      example: analysis.substring(0, 100) + '...'
    }
  ];
  
  return techniques;
}

// Extract title from content
function extractTitleFromContent(content: string): string {
  const lines = content.split('\n');
  const firstLine = lines[0] || content.substring(0, 100);
  return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
}

// Localization helper
function getLocalizedString(key: string, language: string): string {
  const strings: Record<string, Record<string, string>> = {
    'content_analysis': {
      'en': 'Content Analysis',
      'pt-br': 'Análise de Conteúdo',
      'es': 'Análisis de Contenido'
    }
  };
  
  return strings[key]?.[language] || strings[key]?.['en'] || key;
}

export async function analyzeContent(content: string, type: string): Promise<AnalysisResult> {
  try {
    console.log('=== EXTRACTION QUEUE REQUEST ===');
    console.log('URL:', content);
    console.log('Content type:', type);

    // Check if it's a Twitter/X URL - use proper extraction flow
    const isTwitterUrl = /(?:twitter\.com|x\.com)/i.test(content);
    
    console.log('🔍 URL analysis:', content);
    console.log('🔍 Is Twitter URL?', isTwitterUrl);
    
    if (isTwitterUrl) {
      console.log('🐦 Twitter URL detected - using extraction queue');
      alert('DEBUG: Using Twitter extraction flow!');
      
      // Step 1: Submit to extraction queue
      const { data: extractData, error: extractError } = await supabase.functions.invoke('extract', {
        body: { url: content },
      });

      if (extractError) {
        console.error('Extract function error:', extractError);
        throw new Error(`Extraction failed: ${extractError.message}`);
      }

      console.log('✅ Job queued:', extractData);
      const jobId = extractData.job_id;

      // Step 2: Trigger worker to process the queue
      console.log('🔄 Triggering worker...');
      const { data: workerData, error: workerError } = await supabase.functions.invoke('worker', {
        body: {},
      });

      if (workerError) {
        console.warn('Worker trigger warning:', workerError);
      }

      // Step 3: Poll for results
      console.log('⏳ Polling for results...');
      const maxAttempts = 30; // 30 seconds max
      let attempts = 0;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
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
    } else {
      // Non-Twitter URLs: use direct analyze endpoint
      console.log('🌐 Non-Twitter URL - using direct analysis');
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze', {
        body: { content: content },
      });

      if (analysisError) {
        console.error('Analyze function error:', analysisError);
        throw new Error(`Analysis failed: ${analysisError.message}`);
      }

      console.log('=== ANALYSIS SUCCESS ===');
      
      // The analyze endpoint returns the analysis directly, not wrapped in database format
      // Transform to match frontend expectations
      return {
        techniques: analysisData.techniques || [],
        manipulationScore: 0, // Not used in new format
        quickAssessment: analysisData.quickAssessment || '',
        counterPerspective: analysisData.counterPerspective || '',
        reflectionQuestions: analysisData.reflectionQuestions || [],
        sourceInfo: analysisData.sourceInfo || {
          sourceUrl: content,
          contentType: type,
        },
        // Additional fields from the response
        language: analysisData.language || 'en',
        languageConfidence: analysisData.languageConfidence || 0.5,
        extractionFlow: analysisData.extractionFlow,
      };
    }
  } catch (error) {
    console.error('Analysis failed:', error);
    
    // Handle different types of errors with user-friendly messages
    if (error instanceof Error) {
      // Twitter-specific errors
      if (error.message.includes('Twitter API rate limit exceeded')) {
        throw new Error('🐦 Twitter Rate Limit - You\'ve hit Twitter\'s rate limit. Please wait 15 minutes and try again, or try analyzing a different tweet.');
      } else if (error.message.includes('Tweet not found')) {
        throw new Error('🐦 Tweet Not Found - This tweet may have been deleted or the URL is incorrect. Please check the link and try again.');
      } else if (error.message.includes('private or restricted')) {
        throw new Error('🐦 Private Tweet - This tweet is private or restricted and cannot be accessed for analysis.');
      } else if (error.message.includes('Twitter API authentication failed')) {
        throw new Error('🐦 Twitter API Error - There\'s an issue with our Twitter integration. Please try again later.');
      }
      
      // OpenAI errors
      if (error.message.includes('OpenAI')) {
        throw new Error('🤖 AI Analysis Error - Our AI analysis service is temporarily unavailable. Please try again in a few minutes.');
      }
      
      // Network errors
      if (error.message.includes('timeout')) {
        throw new Error('⏰ Timeout Error - The analysis took too long to complete. This may be due to heavy load. Please try again.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('🚦 Rate Limit - Too many requests at once. Please wait a moment and try again.');
      }
      
      // Job processing errors
      if (error.message.includes('Analysis failed:')) {
        // This is already a formatted error from Supabase - pass it through
        throw error;
      }
      
      // Supabase function errors
      if (error.message.includes('FunctionsHttpError')) {
        throw new Error('⚙️ Service Error - Our analysis service encountered an issue. Please try again.');
      }
      
      // Generic error with more context
      throw new Error(`❌ Analysis Error - ${error.message}. If this persists, please try a different URL.`);
    }
    
    throw new Error('❌ Unknown Error - Something went wrong during analysis. Please try again with a different URL.');
  }
}