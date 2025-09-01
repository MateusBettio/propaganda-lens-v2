import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CircularGallery, createAnalysisCards } from './CircularGallery';

// Mock analysis data for demo
const mockAnalysis = {
  techniques: [
    { name: 'Emotional Appeal' },
    { name: 'False Dichotomy' },
    { name: 'Repetition' },
  ],
  confidence: 0.75,
  summary: 'This content employs several persuasive techniques commonly found in propaganda. The analysis detected emotional appeals designed to bypass rational thinking, false dichotomies that oversimplify complex issues, and repetitive messaging to reinforce key points.',
};

export function CircularGalleryDemo() {
  const handleShare = () => {
    console.log('Demo: Share analysis');
    // In a real app, this would trigger sharing functionality
  };

  return (
    <View style={styles.container}>
      <CircularGallery
        items={createAnalysisCards(mockAnalysis, handleShare)}
        analysis={mockAnalysis}
        onShare={handleShare}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
});