import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/theme-context';
import { SkeletonLoader } from './skeleton-loader';

interface TwitterSkeletonProps {
  showQuickAssessment?: boolean;
}

export function TwitterSkeleton({ showQuickAssessment = true }: TwitterSkeletonProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.resultsContainer}>
      <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={24} width="60%" style={{ marginBottom: 16 }} />
        
        <View style={[styles.embedContainer, { backgroundColor: colors.surface }]}>
          <SkeletonLoader height={250} borderRadius={12} />
        </View>
        
        {showQuickAssessment && (
          <View style={styles.quickAssessmentContainer}>
            <SkeletonLoader height={24} width={80} borderRadius={12} style={{ marginBottom: 12 }} />
            <SkeletonLoader height={20} width="100%" style={{ marginBottom: 8 }} />
            <SkeletonLoader height={20} width="85%" style={{ marginBottom: 8 }} />
            <SkeletonLoader height={20} width="70%" />
          </View>
        )}
      </View>

      <View style={[styles.assessmentCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={18} width="50%" style={{ marginBottom: 16 }} />
        {[...Array(3)].map((_, index) => (
          <View key={index} style={[styles.techniqueItem, { backgroundColor: colors.surface }]}>
            <View style={styles.techniqueHeader}>
              <SkeletonLoader height={16} width="40%" />
              <SkeletonLoader height={20} width={60} borderRadius={10} />
            </View>
            <SkeletonLoader height={14} width="90%" style={{ marginTop: 8, marginBottom: 4 }} />
            <SkeletonLoader height={14} width="75%" />
          </View>
        ))}
      </View>

      <View style={[styles.assessmentCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={18} width="40%" style={{ marginBottom: 12 }} />
        <SkeletonLoader height={16} width="100%" style={{ marginBottom: 6 }} />
        <SkeletonLoader height={16} width="95%" style={{ marginBottom: 6 }} />
        <SkeletonLoader height={16} width="85%" />
      </View>

      <View style={[styles.assessmentCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={18} width="45%" style={{ marginBottom: 12 }} />
        {[...Array(3)].map((_, index) => (
          <View key={index} style={{ marginBottom: 8 }}>
            <SkeletonLoader height={16} width="95%" style={{ marginBottom: 4 }} />
            <SkeletonLoader height={16} width="80%" />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  resultsContainer: {
    marginTop: 20,
  },
  headerCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  embedContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 250,
    marginVertical: 16,
  },
  quickAssessmentContainer: {
    marginTop: 16,
  },
  assessmentCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  },
});