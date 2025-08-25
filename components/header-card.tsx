import React from 'react';
import { View, Text, Image } from 'react-native';
import { AnalysisResult } from '../types';
import { useTheme } from '../contexts/theme-context';
import { TwitterEmbed } from './twitter-embed';
import { TwitterQuickAssessment } from './twitter-quick-assessment';
import { createStyles } from './header-card.styles';

// Localization helpers
function getLocalizedResultTitle(language: string): string {
  const titles = {
    'en': 'Analysis Complete',
    'pt-br': 'Análise Concluída',
    'es': 'Análisis Completado'
  };
  return titles[language as keyof typeof titles] || titles['en'];
}

interface HeaderCardProps {
  result: AnalysisResult;
}

export function HeaderCard({ result }: HeaderCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isTwitter = result.sourceInfo?.extractedData?.type === 'twitter';

  return (
    <View style={styles.headerCard}>
      <Text style={styles.resultTitle}>
        {getLocalizedResultTitle(result.language || 'en')}
      </Text>
      
      {isTwitter && result.sourceInfo?.extractedData?.embedHtml && (
        <TwitterEmbed 
          embedHtml={result.sourceInfo.extractedData.embedHtml}
          colors={colors}
        />
      )}
      
      {isTwitter && result.quickAssessment && (
        <TwitterQuickAssessment 
          quickAssessment={result.quickAssessment}
          colors={colors}
        />
      )}
      
      {!isTwitter && result.sourceInfo && (
        <View style={styles.sourceContainer}>
          {result.sourceInfo.extractedData?.thumbnail && (
            <Image 
              source={{ uri: result.sourceInfo.extractedData.thumbnail }} 
              style={styles.thumbnail} 
            />
          )}
          <View style={styles.sourceTextContainer}>
            <Text style={styles.sourceText}>
              Source: {new URL(result.sourceInfo.sourceUrl).hostname}
            </Text>
            {result.sourceInfo.extractedData?.title && (
              <Text style={styles.sourceTitle} numberOfLines={2}>
                {result.sourceInfo.extractedData.title}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}