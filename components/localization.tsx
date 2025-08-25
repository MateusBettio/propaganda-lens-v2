export function getLocalizedResultTitle(language: string): string {
  const titles = {
    'en': 'Analysis Complete',
    'pt-br': 'Análise Concluída',
    'es': 'Análisis Completado'
  };
  return titles[language as keyof typeof titles] || titles['en'];
}

export function getLocalizedString(key: string, language: string): string {
  const strings: Record<string, Record<string, string>> = {
    'quick_assessment': {
      'en': 'Quick Assessment',
      'pt-br': 'Avaliação Rápida',
      'es': 'Evaluación Rápida'
    },
    'techniques_detected': {
      'en': 'Propaganda Techniques Detected',
      'pt-br': 'Técnicas de Propaganda Detectadas',
      'es': 'Técnicas de Propaganda Detectadas'
    },
    'alternative_perspective': {
      'en': 'Alternative Perspective',
      'pt-br': 'Perspectiva Alternativa',
      'es': 'Perspectiva Alternativa'
    },
    'critical_thinking': {
      'en': 'Critical Thinking Questions',
      'pt-br': 'Perguntas de Pensamento Crítico',
      'es': 'Preguntas de Pensamiento Crítico'
    }
  };
  
  return strings[key]?.[language] || strings[key]?.['en'] || key;
}