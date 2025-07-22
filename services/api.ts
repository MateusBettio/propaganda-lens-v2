import { supabase } from '../lib/supabase';
import { AnalysisResult } from '../types';

export async function analyzeContent(content: string, type: string): Promise<AnalysisResult> {
  try {
    console.log('=== SUPABASE EDGE FUNCTION REQUEST ===');
    console.log('Content length:', content.length);
    console.log('Content preview:', content.substring(0, 200) + (content.length > 200 ? '...' : ''));
    console.log('Content type:', type);

    console.log('Invoking Edge Function: analyze');
    const { data, error } = await supabase.functions.invoke('analyze', {
      body: {
        content,
        contentType: type,
      },
    });

    console.log('=== SUPABASE RESPONSE ===');
    console.log('Error:', error);
    console.log('Data:', data);
    
    if (error) {
      console.error('Supabase function error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Analysis failed: ${error.message}`);
    }

    console.log('=== SUPABASE RESPONSE SUCCESS ===');
    console.log('Full response data:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Analysis failed:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('OpenAI')) {
        throw new Error('Source: OpenAI API - OpenAI service error. Please try again later.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Source: Network timeout - Request took too long to complete.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('Source: Rate limiting - Too many requests. Please try again later.');
      } else if (error.message.includes('Analysis failed:')) {
        // This is already a formatted error from Supabase
        throw error;
      }
      
      // Check if it's a Supabase-specific error
      if (error.message.includes('FunctionsHttpError')) {
        throw new Error('Source: Supabase function - Edge function returned an error. Please try again.');
      }
      
      throw new Error(`Source: Unknown error - ${error.message}`);
    }
    
    throw new Error('Source: Unknown error - Failed to analyze content. Please try again.');
  }
}