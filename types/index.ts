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
  indicators?: string[];
  confidence?: number;
  sourceMetadata?: Record<string, unknown>;
  extractionFlow?: ExtractionFlow;
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

export interface ExtractionFlow {
  summary: string;
  steps: string[];
  contentInfo: {
    source: string;
    extractionMethod?: string;
    contentLength: number;
    hasTranscript?: boolean;
    thumbnailFound?: boolean;
  };
}

export interface ColorScheme {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  error: string;
  warning: string;
  success: string;
  border: string;
}