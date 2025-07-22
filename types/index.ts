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
}

export interface Technique {
  name: string;
  description: string;
  confidence: 'low' | 'medium' | 'high';
  example: string;
}