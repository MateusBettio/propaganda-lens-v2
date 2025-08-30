import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Variant, VARIANT_CONFIGS } from './types';
import { likelyDeceptiveSvg, likelySafeSvg, analysisErrorSvg } from './AnalysisIcons';

interface HeaderProps {
  variant: Variant;
  confidence?: number;
}

const AnalysisIcon: React.FC<{ variant: Variant }> = ({ variant }) => {
  const getIconSvg = () => {
    switch (variant) {
      case 'deceptive':
        return likelyDeceptiveSvg;
      case 'safe':
        return likelySafeSvg;
      case 'error':
      case 'loading':
        return analysisErrorSvg;
      case 'satire':
        return likelySafeSvg; // Use safe icon for satire
      default:
        return analysisErrorSvg;
    }
  };

  const svgString = getIconSvg();
  
  return (
    <View style={styles.iconContainer}>
      <SvgXml xml={svgString} width={80} height={80} />
    </View>
  );
};

export const Header: React.FC<HeaderProps> = React.memo(({
  variant,
  confidence = 0.75
}) => {
  const config = VARIANT_CONFIGS[variant];
  
  const getTitle = () => {
    switch (variant) {
      case 'deceptive':
        return 'Likely Deceptive';
      case 'safe':
        return 'Likely Safe';
      case 'satire':
        return 'Satire / Meme';
      case 'error':
        return 'Unable to Verify';
      case 'loading':
        return 'Analyzing...';
      default:
        return 'Analysis Result';
    }
  };

  const getDescription = () => {
    switch (variant) {
      case 'deceptive':
        return 'This content is likely to use manipulation techniques';
      case 'safe':
        return 'No significant manipulation detected in this content';
      case 'satire':
        return 'This appears to be satirical or humorous content';
      case 'error':
        return 'Could not perform a complete analysis';
      case 'loading':
        return 'Please wait while we analyze the content';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <AnalysisIcon variant={variant} />
      
      <Text style={styles.title}>
        {getTitle()}
      </Text>
      
      <Text style={styles.description}>
        {getDescription()}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});