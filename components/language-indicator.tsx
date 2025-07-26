import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/theme-context';

interface LanguageIndicatorProps {
  language: 'en' | 'pt-br' | 'es';
  confidence: number;
}

const LANGUAGE_LABELS = {
  'en': { name: 'English', flag: '🇺🇸' },
  'pt-br': { name: 'Português', flag: '🇧🇷' },
  'es': { name: 'Español', flag: '🇪🇸' }
};

const CONFIDENCE_COLORS = {
  high: '#10b981',
  medium: '#f59e0b', 
  low: '#ef4444'
};

export function LanguageIndicator({ language, confidence }: LanguageIndicatorProps) {
  const { colors } = useTheme();
  
  const languageInfo = LANGUAGE_LABELS[language];
  const confidenceLevel = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low';
  const confidenceColor = CONFIDENCE_COLORS[confidenceLevel];
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.languageSection}>
        <Text style={styles.flag}>{languageInfo.flag}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.languageName, { color: colors.text }]}>
            {languageInfo.name}
          </Text>
          <Text style={[styles.detectedLabel, { color: colors.textSecondary }]}>
            Content Language
          </Text>
        </View>
      </View>
      
      <View style={styles.confidenceSection}>
        <View style={[styles.confidenceDot, { backgroundColor: confidenceColor }]} />
        <Text style={[styles.confidenceText, { color: colors.textSecondary }]}>
          {Math.round(confidence * 100)}% confidence
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  languageSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
  },
  detectedLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  confidenceSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
  },
});