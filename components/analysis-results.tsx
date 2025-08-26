import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { AnalysisResult } from '../types';
import { useTheme } from '../contexts/theme-context';
import { Card } from './Card';

interface AnalysisResultsProps {
  result: AnalysisResult;
  contentOpacity: Animated.Value;
}

export function AnalysisResults({ result, contentOpacity }: AnalysisResultsProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Localization helper
  const getLocalizedString = (key: string, language: string) => {
    const strings: Record<string, Record<string, string>> = {
      'analysis_complete': {
        'en': 'Analysis Complete',
        'pt-br': 'Análise Concluída',
        'es': 'Análisis Completado'
      },
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
  };

  return (
    <View style={styles.container}>
      {/* Header Card */}
      <Card variant="header" title={getLocalizedString('analysis_complete', result.language || 'en')}>
        {result.sourceInfo?.sourceUrl && (
          <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
            Source: {new URL(result.sourceInfo.sourceUrl).hostname}
          </Text>
        )}
      </Card>

      {/* Quick Assessment Card */}
      <Card variant="assessment" title={getLocalizedString('quick_assessment', result.language || 'en')}>
        <Text style={[styles.assessmentText, { color: colors.textSecondary }]}>
          {result.quickAssessment}
        </Text>
      </Card>

      {/* Techniques Card */}
      {result.techniques && result.techniques.length > 0 && (
        <Card variant="techniques" title={`${getLocalizedString('techniques_detected', result.language || 'en')} (${result.techniques.length})`}>
          {result.techniques.map((technique, index) => (
            <Pressable key={index} style={[styles.techniqueItem, { backgroundColor: colors.surface }]}>
              <View style={styles.techniqueHeader}>
                <Text style={[styles.techniqueName, { color: colors.text }]}>{technique.name}</Text>
                <View style={[
                  styles.confidenceBadge,
                  technique.confidence === 'high' ? styles.confidenceHigh :
                  technique.confidence === 'medium' ? styles.confidenceMedium : styles.confidenceLow
                ]}>
                  <Text style={styles.confidenceText}>{technique.confidence}</Text>
                </View>
              </View>
              <Text style={[styles.techniqueDescription, { color: colors.textSecondary }]}>
                {technique.description}
              </Text>
              {technique.example && technique.example.trim() && (
                <Text style={[styles.techniqueExample, { color: colors.textSecondary }]}>
                  Example: "{technique.example}"
                </Text>
              )}
            </Pressable>
          ))}
        </Card>
      )}

      {/* Counter Perspective Card */}
      {result.counterPerspective && (
        <Card variant="assessment" title={getLocalizedString('alternative_perspective', result.language || 'en')}>
          <Text style={[styles.assessmentText, { color: colors.textSecondary }]}>
            {result.counterPerspective}
          </Text>
        </Card>
      )}

      {/* Critical Thinking Questions Card */}
      {result.reflectionQuestions && result.reflectionQuestions.length > 0 && (
        <Card variant="assessment" title={getLocalizedString('critical_thinking', result.language || 'en')}>
          {result.reflectionQuestions.map((question, index) => (
            <Text key={index} style={[styles.question, { color: colors.textSecondary }]}>
              • {question}
            </Text>
          ))}
        </Card>
      )}
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      marginTop: 24,
      width: '100%',
    },
    sourceText: {
      fontSize: 14,
      marginBottom: 8,
    },
    assessmentText: {
      fontSize: 16,
      lineHeight: 22,
    },
    techniqueItem: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    techniqueHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    techniqueName: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
    },
    techniqueDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 8,
    },
    techniqueExample: {
      fontSize: 13,
      lineHeight: 18,
      fontStyle: 'italic',
    },
    confidenceBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 12,
    },
    confidenceHigh: {
      backgroundColor: colors.error,
    },
    confidenceMedium: {
      backgroundColor: colors.warning,
    },
    confidenceLow: {
      backgroundColor: colors.success,
    },
    confidenceText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    question: {
      fontSize: 15,
      lineHeight: 21,
      marginBottom: 8,
    },
  });
}