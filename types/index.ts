/**
 * Core type definitions for Propaganda Lens V2
 * Following development principles: clear, self-documenting types
 */

export interface SharedContent {
  type: 'text' | 'url' | 'image' | 'video';
  content: string;
  timestamp: number;
}

export interface AnalysisResult {
  techniques: Technique[];
  manipulationScore: number;
  quickAssessment: string;
  counterPerspective: string;
  reflectionQuestions: string[];
  sourceInfo?: SourceInfo;
  // New multilingual fields
  language?: 'en' | 'pt-br' | 'es';
  languageConfidence?: number;
  content?: string;
  summary?: string;
  indicators?: Record<string, any>;
  confidence?: number;
  sourceMetadata?: Record<string, any>;
  extractionFlow?: any;
}

export interface SourceInfo {
  sourceUrl: string;
  contentType: string;
  extractedData?: {
    type: string;
    thumbnail?: string;
    imageUrl?: string;
    videoId?: string;
    title?: string;
    description?: string;
    preview?: string;
    embedHtml?: string;
    embedUrl?: string;
    tweetId?: string;
    postId?: string;
  };
}

export interface Technique {
  name: string;
  description: string;
  confidence: 'low' | 'medium' | 'high';
  example: string;
}