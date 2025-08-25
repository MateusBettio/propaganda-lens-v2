import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/theme-context';
import { SkeletonLoader } from './skeleton-loader';

export function WebpageSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.resultsContainer}>
      <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={24} width="60%" style={{ marginBottom: 16 }} />
        
        <View style={styles.sourceContainer}>
          <SkeletonLoader height={60} width={60} borderRadius={8} style={{ marginRight: 12 }} />
          <View style={styles.sourceTextContainer}>
            <SkeletonLoader height={14} width="40%" style={{ marginBottom: 6 }} />
            <SkeletonLoader height={16} width="90%" style={{ marginBottom: 4 }} />
            <SkeletonLoader height={16} width="75%" />
          </View>
        </View>
      </View>

      <View style={[styles.assessmentCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={18} width="45%" style={{ marginBottom: 12 }} />
        <SkeletonLoader height={16} width="100%" style={{ marginBottom: 6 }} />
        <SkeletonLoader height={16} width="95%" style={{ marginBottom: 6 }} />
        <SkeletonLoader height={16} width="85%" style={{ marginBottom: 6 }} />
        <SkeletonLoader height={16} width="70%" />
      </View>

      <View style={[styles.assessmentCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={18} width="50%" style={{ marginBottom: 16 }} />
        {[...Array(2)].map((_, index) => (
          <View key={index} style={[styles.techniqueItem, { backgroundColor: colors.surface }]}>
            <View style={styles.techniqueHeader}>
              <SkeletonLoader height={16} width="40%" />
              <SkeletonLoader height={20} width={60} borderRadius={10} />
            </View>
            <SkeletonLoader height={14} width="95%" style={{ marginTop: 8, marginBottom: 4 }} />
            <SkeletonLoader height={14} width="80%" style={{ marginBottom: 8 }} />
            <SkeletonLoader height={14} width="70%" />
          </View>
        ))}
      </View>

      <View style={[styles.assessmentCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={18} width="40%" style={{ marginBottom: 12 }} />
        <SkeletonLoader height={16} width="100%" style={{ marginBottom: 6 }} />
        <SkeletonLoader height={16} width="90%" style={{ marginBottom: 6 }} />
        <SkeletonLoader height={16} width="80%" />
      </View>

      <View style={[styles.assessmentCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={18} width="45%" style={{ marginBottom: 12 }} />
        {[...Array(3)].map((_, index) => (
          <View key={index} style={{ marginBottom: 8 }}>
            <SkeletonLoader height={16} width="90%" style={{ marginBottom: 4 }} />
            <SkeletonLoader height={16} width="85%" />
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
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sourceTextContainer: {
    flex: 1,
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