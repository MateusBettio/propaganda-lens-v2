import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Variant, VARIANT_CONFIGS } from './types';

interface HeaderProps {
  variant: Variant;
  confidence?: number;
}

const ProgressGauge: React.FC<{ confidence: number; color: string }> = ({ confidence, color }) => {
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const strokeDashoffset = circumference - (confidence * circumference);

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size}>
        {/* Background arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
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
      <ProgressGauge confidence={confidence} color={config.color} />
      
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
  gaugeContainer: {
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