import axios from 'axios';
import { AnalysisResult, Technique } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://propaganda-lens-ai.vercel.app';
const API_KEY = process.env.EXPO_PUBLIC_PROPAGANDA_LENS_API_KEY;

// The new backend returns responses in the exact format the frontend expects

export async function analyzeContent(content: string, type: string): Promise<AnalysisResult> {
  try {
    console.log('=== PROPAGANDA LENS API REQUEST ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Content length:', content.length);
    console.log('Content preview:', content.substring(0, 200) + (content.length > 200 ? '...' : ''));
    console.log('Content type:', type);
    console.log('Full request payload:', JSON.stringify({ content, contentType: type }, null, 2));

    const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
      content,
      contentType: type,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout for new backend
    });
    
    console.log('=== BACKEND RESPONSE ===');
    console.log('Response status:', response.status);
    console.log('Full response data:', JSON.stringify(response.data, null, 2));
    
    // New backend returns data in the exact format we need
    return response.data;
  } catch (error) {
    console.error('Analysis failed:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Backend authentication failed. OpenAI API key may be missing or invalid.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      } else if (error.response?.status === 500) {
        throw new Error('Backend error. Please check if OpenAI API key is configured.');
      }
    }
    
    throw new Error('Failed to analyze content. Please try again.');
  }
}