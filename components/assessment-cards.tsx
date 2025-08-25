import React from 'react';
import { View, Text } from 'react-native';
import { AnalysisResult } from '../types';
import { useTheme } from '../contexts/theme-context';
import { createStyles } from './assessment-cards.styles';

// Localization helpers
function getLocalizedString(key: string, language: string): string {
  const strings: Record<string, Record<string, string>> = {
    'quick_assessment': {
      'en': 'Quick Assessment',
      'pt-br': 'Avaliação Rápida',
      'es': 'Evaluación Rápida'
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

interface AssessmentCardsProps {
  result: AnalysisResult;
}

export function AssessmentCards({ result }: AssessmentCardsProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isTwitter = result.sourceInfo?.extractedData?.type === 'twitter';

  return (
    <>
      {/* Assessment Card - Only for non-Twitter content */}
      {!isTwitter && (
        <View style={styles.assessmentCard}>
          <Text style={styles.cardTitle}>
            {getLocalizedString('quick_assessment', result.language || 'en')}
          </Text>
          <Text style={styles.assessmentText}>{result.quickAssessment}</Text>
        </View>
      )}

      {/* Counter Perspective Card */}
      {result.counterPerspective && (
        <View style={styles.counterCard}>
          <Text style={styles.cardTitle}>
            {getLocalizedString('alternative_perspective', result.language || 'en')}
          </Text>
          <Text style={styles.counterText}>{result.counterPerspective}</Text>
        </View>
      )}

      {/* Questions Card */}
      {result.reflectionQuestions && result.reflectionQuestions.length > 0 && (
        <View style={styles.questionsCard}>
          <Text style={styles.cardTitle}>
            {getLocalizedString('critical_thinking', result.language || 'en')}
          </Text>
          {result.reflectionQuestions.map((question, index) => (
            <View key={index} style={styles.questionItem}>
              <Text style={styles.questionNumber}>{index + 1}.</Text>
              <Text style={styles.questionText}>{question}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
}