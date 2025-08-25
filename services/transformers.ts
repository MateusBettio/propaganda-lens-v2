import { AnalysisResult } from '../types';

export function transformBackendResponse(backendData: Record<string, unknown>, originalUrl: string): AnalysisResult {
  const summary = (backendData.summary as string) || '';
  const techniques = extractTechniquesFromAnalysis(summary, (backendData.language as string) || 'en');
  
  return {
    techniques,
    manipulationScore: Math.round(((backendData.confidence as number) || 0.5) * 100),
    quickAssessment: summary,
    counterPerspective: '',
    reflectionQuestions: [],
    sourceInfo: {
      sourceUrl: originalUrl,
      contentType: (backendData.sourceMetadata as Record<string, unknown>)?.platform as string || 'web',
      extractedData: {
        type: (backendData.sourceMetadata as Record<string, unknown>)?.platform as string || 'web',
        title: extractTitleFromContent((backendData.content as string) || ''),
      }
    },
    language: ((backendData.language as string) === 'pt-br' || (backendData.language as string) === 'es' ? (backendData.language as 'pt-br' | 'es') : 'en'),
    languageConfidence: (backendData.language_confidence as number) || 0.5,
    content: backendData.content as string,
    summary: summary,
    indicators: backendData.indicators as string[],
    confidence: backendData.confidence as number,
    sourceMetadata: backendData.sourceMetadata as Record<string, unknown>,
  };
}

function extractTechniquesFromAnalysis(analysis: string, language: string) {
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

function extractTitleFromContent(content: string): string {
  const lines = content.split('\n');
  const firstLine = lines[0] || content.substring(0, 100);
  return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
}

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