import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AnalysisResult, Technique, ColorScheme } from '../types';
import { useTheme } from '../contexts/theme-context';
import { createStyles } from './techniques-card.styles';

// Localization helper
function getLocalizedString(key: string, language: string): string {
  const strings: Record<string, Record<string, string>> = {
    'techniques_detected': {
      'en': 'Propaganda Techniques Detected',
      'pt-br': 'Técnicas de Propaganda Detectadas',
      'es': 'Técnicas de Propaganda Detectadas'
    }
  };
  
  return strings[key]?.[language] || strings[key]?.['en'] || key;
}

interface TechniquesCardProps {
  result: AnalysisResult;
}

interface TechniqueItemProps {
  technique: Technique;
  index: number;
  colors: ColorScheme;
}

function TechniqueItem({ technique, index, colors }: TechniqueItemProps) {
  const styles = createStyles(colors);
  
  console.log(`Technique ${index}:`, JSON.stringify(technique, null, 2));
  
  return (
    <Pressable style={styles.techniqueItem}>
      <View style={styles.techniqueHeader}>
        <Text style={styles.techniqueName}>{technique.name}</Text>
        <View style={[
          styles.confidenceBadge,
          technique.confidence === 'high' ? styles.confidenceHigh :
          technique.confidence === 'medium' ? styles.confidenceMedium : styles.confidenceLow
        ]}>
          <Text style={styles.confidenceText}>{technique.confidence}</Text>
        </View>
      </View>
      <Text style={styles.techniqueDescription}>{technique.description}</Text>
      {technique.example && technique.example.trim() && (
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleLabel}>Example:</Text>
          <Text style={styles.exampleText}>"{technique.example}"</Text>
        </View>
      )}
      {/* Debug info */}
      {__DEV__ && (
        <Text style={{ fontSize: 10, color: 'red' }}>
          Example: {technique.example ? `"${technique.example}"` : 'null/undefined'}
        </Text>
      )}
    </Pressable>
  );
}

export function TechniquesCard({ result }: TechniquesCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  if (!result.techniques || result.techniques.length === 0) {
    return null;
  }

  return (
    <View style={styles.techniquesCard}>
      <Text style={styles.cardTitle}>
        {getLocalizedString('techniques_detected', result.language || 'en')} ({result.techniques.length})
      </Text>
      {result.techniques.map((technique, index) => (
        <TechniqueItem
          key={index}
          technique={technique}
          index={index}
          colors={colors}
        />
      ))}
    </View>
  );
}