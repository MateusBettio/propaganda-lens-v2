import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ColorScheme } from '../types';

interface TwitterQuickAssessmentProps {
  quickAssessment: string;
  colors: ColorScheme;
}

export function TwitterQuickAssessment({ quickAssessment, colors }: TwitterQuickAssessmentProps) {
  // Parse tweet type from assessment
  const parseTweetType = (assessment: string) => {
    console.log('DEBUG: quickAssessment for Twitter:', assessment);
    console.log('DEBUG: First 50 chars:', assessment.substring(0, 50));
    
    // Look specifically for [TYPE] pattern at the start
    const tweetTypeMatch = assessment.match(/^\[([A-Z]+)\]/);
    console.log('DEBUG: tweetTypeMatch:', tweetTypeMatch);
    
    let tweetType = null;
    let cleanedAssessment = assessment;
    
    if (tweetTypeMatch) {
      tweetType = tweetTypeMatch[1].toLowerCase();
      cleanedAssessment = assessment.replace(/^\[([A-Z]+)\]\s*/, '');
    } else {
      // Try alternative patterns
      const altMatch = assessment.match(/^([A-Z]+):\s*(.*)$/i);
      console.log('DEBUG: altMatch (TYPE: format):', altMatch);
      
      if (altMatch) {
        tweetType = altMatch[1].toLowerCase();
        cleanedAssessment = altMatch[2];
      } else {
        // Try to find type words in the text
        const typeWords = ['humor', 'meme', 'serious', 'news', 'opinion'];
        for (const word of typeWords) {
          if (assessment.toLowerCase().includes(word)) {
            tweetType = word;
            break;
          }
        }
      }
    }
    
    console.log('DEBUG: Final tweetType:', tweetType);
    console.log('DEBUG: cleanedAssessment:', cleanedAssessment.substring(0, 50));
    
    return { tweetType, cleanedAssessment };
  };

  const { tweetType, cleanedAssessment } = parseTweetType(quickAssessment);

  const getTweetTypeConfig = (type: string | null) => {
    const configs = {
      humor: { bg: colors.warning + '20', text: colors.warning, emoji: '😄' },
      meme: { bg: colors.primary + '20', text: colors.primary, emoji: '🎭' },
      serious: { bg: colors.textSecondary + '20', text: colors.textSecondary, emoji: '💼' },
      news: { bg: colors.error + '20', text: colors.error, emoji: '📰' },
      opinion: { bg: colors.success + '20', text: colors.success, emoji: '💭' },
      unknown: { bg: colors.border + '20', text: colors.textSecondary, emoji: '❓' }
    };
    
    return configs[type as keyof typeof configs] || configs.unknown;
  };

  const typeConfig = getTweetTypeConfig(tweetType);
  const displayType = (tweetType && ['humor', 'meme', 'serious', 'news', 'opinion', 'unknown'].includes(tweetType)) 
    ? tweetType.toUpperCase() 
    : 'TWEET';

  return (
    <View style={styles.quickAssessmentContainer}>
      <View style={[styles.tweetTypeBadge, { backgroundColor: typeConfig.bg }]}>
        <Text style={[styles.tweetTypeText, { color: typeConfig.text }]}>
          {typeConfig.emoji} {displayType}
        </Text>
      </View>
      <Text style={[styles.quickAssessmentText, { color: colors.textSecondary }]}>
        {cleanedAssessment}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  quickAssessmentContainer: {
    marginTop: 16,
  },
  tweetTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  tweetTypeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickAssessmentText: {
    fontSize: 16,
    lineHeight: 24,
  },
});