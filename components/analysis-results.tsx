import React from 'react';
import { View, Animated } from 'react-native';
import { AnalysisResult } from '../types';
import { useTheme } from '../contexts/theme-context';
import { HeaderCard } from './header-card';
import { TechniquesCard } from './techniques-card';
import { AssessmentCards } from './assessment-cards';
import { createStyles } from './analysis-results.styles';

interface AnalysisResultsProps {
  result: AnalysisResult;
  contentOpacity: Animated.Value;
}

export function AnalysisResults({ result, contentOpacity }: AnalysisResultsProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Animated.View style={[styles.resultsContainer, { opacity: contentOpacity }]}>
      <HeaderCard result={result} />
      
      <AssessmentCards result={result} />
      
      <TechniquesCard result={result} />
    </Animated.View>
  );
}