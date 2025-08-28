import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Variant } from './types';
import { TechniquesList } from './TechniquesList';

interface AnalysisBodyPlaceholderProps {
  variant: Variant;
  testContent?: boolean;
  techniques?: any[];
  quickAssessment?: string;
  counterPerspective?: string;
  reflectionQuestions?: string[];
}

export const AnalysisBodyPlaceholder: React.FC<AnalysisBodyPlaceholderProps> = React.memo(({ 
  variant, 
  testContent,
  techniques = [],
  quickAssessment,
  counterPerspective,
  reflectionQuestions = []
}) => {
  const isLoading = variant === 'loading';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.skeleton} />
        <View style={[styles.skeleton, styles.skeletonShort]} />
        <View style={styles.skeleton} />
      </View>
    );
  }

  const handleTechniquePress = (technique: any) => {
    console.log('Technique pressed:', technique.title);
  };

  return (
    <View style={styles.container}>
      <TechniquesList onTechniquePress={handleTechniquePress} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
  },
  skeleton: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonShort: {
    width: '60%',
  },
});