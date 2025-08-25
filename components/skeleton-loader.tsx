import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native';
import { useTheme } from '../contexts/theme-context';

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonLoaderProps) {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.surface,
            opacity,
            borderRadius,
          },
        ]}
      />
    </View>
  );
}

interface TwitterSkeletonProps {
  showQuickAssessment?: boolean;
}

export function TwitterSkeleton({ showQuickAssessment = true }: TwitterSkeletonProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.resultsContainer}>
      {/* Header Card Skeleton */}
      <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={24} width="60%" style={{ marginBottom: 16 }} />
        
        {/* Embedded Tweet Skeleton */}
        <View style={[styles.embedContainer, { backgroundColor: colors.surface }]}>
          <SkeletonLoader height={250} borderRadius={12} />
        </View>
        
        {/* Quick Assessment Skeleton for Twitter */}
        {showQuickAssessment && (
          <View style={styles.quickAssessmentContainer}>
            <SkeletonLoader height={24} width={80} borderRadius={12} style={{ marginBottom: 12 }} />
            <SkeletonLoader height={20} width="100%" style={{ marginBottom: 8 }} />
            <SkeletonLoader height={20} width="85%" style={{ marginBottom: 8 }} />
            <SkeletonLoader height={20} width="70%" />
          </View>
        )}
      </View>

      {/* Techniques Card Skeleton */}
      <View style={[styles.assessmentCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={18} width="50%" style={{ marginBottom: 16 }} />
        
        {/* Technique Items */}
        <View style={[styles.techniqueItem, { backgroundColor: colors.surface }]}>
          <View style={styles.techniqueHeader}>
            <SkeletonLoader height={16} width="40%" />
            <SkeletonLoader height={24} width={60} borderRadius={12} />
          </View>
          <SkeletonLoader height={14} width="90%" style={{ marginBottom: 8 }} />
          <SkeletonLoader height={14} width="75%" />
        </View>
        
        <View style={[styles.techniqueItem, { backgroundColor: colors.surface }]}>
          <View style={styles.techniqueHeader}>
            <SkeletonLoader height={16} width="35%" />
            <SkeletonLoader height={24} width={60} borderRadius={12} />
          </View>
          <SkeletonLoader height={14} width="85%" style={{ marginBottom: 8 }} />
          <SkeletonLoader height={14} width="80%" />
        </View>
      </View>

      {/* Counter Perspective Card Skeleton */}
      <View style={[styles.counterCard, { backgroundColor: colors.success + '15' }]}>
        <SkeletonLoader height={18} width="45%" style={{ marginBottom: 16 }} />
        <SkeletonLoader height={16} width="100%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={16} width="90%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={16} width="85%" />
      </View>

      {/* Questions Card Skeleton */}
      <View style={[styles.questionsCard, { backgroundColor: colors.warning + '15' }]}>
        <SkeletonLoader height={18} width="55%" style={{ marginBottom: 16 }} />
        
        <View style={styles.questionItem}>
          <SkeletonLoader height={16} width={20} style={{ marginRight: 8 }} />
          <SkeletonLoader height={16} width="85%" />
        </View>
        
        <View style={styles.questionItem}>
          <SkeletonLoader height={16} width={20} style={{ marginRight: 8 }} />
          <SkeletonLoader height={16} width="80%" />
        </View>
        
        <View style={styles.questionItem}>
          <SkeletonLoader height={16} width={20} style={{ marginRight: 8 }} />
          <SkeletonLoader height={16} width="75%" />
        </View>
      </View>
    </View>
  );
}

interface WebpageSkeletonProps {}

export function WebpageSkeleton({}: WebpageSkeletonProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.resultsContainer}>
      {/* Header Card Skeleton */}
      <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={24} width="60%" style={{ marginBottom: 16 }} />
        
        {/* Source info with thumbnail */}
        <View style={styles.sourceContainer}>
          <SkeletonLoader height={60} width={60} borderRadius={8} style={{ marginRight: 12 }} />
          <View style={styles.sourceTextContainer}>
            <SkeletonLoader height={14} width="70%" style={{ marginBottom: 4 }} />
            <SkeletonLoader height={16} width="100%" style={{ marginBottom: 4 }} />
            <SkeletonLoader height={16} width="85%" />
          </View>
        </View>
      </View>

      {/* Assessment Card Skeleton */}
      <View style={[styles.assessmentCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={18} width="45%" style={{ marginBottom: 16 }} />
        <SkeletonLoader height={16} width="100%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={16} width="95%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={16} width="90%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={16} width="80%" />
      </View>

      {/* Techniques Card Skeleton */}
      <View style={[styles.assessmentCard, { backgroundColor: colors.card }]}>
        <SkeletonLoader height={18} width="55%" style={{ marginBottom: 16 }} />
        
        <View style={[styles.techniqueItem, { backgroundColor: colors.surface }]}>
          <View style={styles.techniqueHeader}>
            <SkeletonLoader height={16} width="40%" />
            <SkeletonLoader height={24} width={60} borderRadius={12} />
          </View>
          <SkeletonLoader height={14} width="90%" style={{ marginBottom: 8 }} />
          <SkeletonLoader height={14} width="75%" />
        </View>
        
        <View style={[styles.techniqueItem, { backgroundColor: colors.surface }]}>
          <View style={styles.techniqueHeader}>
            <SkeletonLoader height={16} width="35%" />
            <SkeletonLoader height={24} width={60} borderRadius={12} />
          </View>
          <SkeletonLoader height={14} width="85%" style={{ marginBottom: 8 }} />
          <SkeletonLoader height={14} width="80%" />
        </View>
      </View>

      {/* Counter Perspective and Questions - same as Twitter */}
      <View style={[styles.counterCard, { backgroundColor: colors.success + '15' }]}>
        <SkeletonLoader height={18} width="45%" style={{ marginBottom: 16 }} />
        <SkeletonLoader height={16} width="100%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={16} width="90%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={16} width="85%" />
      </View>

      <View style={[styles.questionsCard, { backgroundColor: colors.warning + '15' }]}>
        <SkeletonLoader height={18} width="55%" style={{ marginBottom: 16 }} />
        
        <View style={styles.questionItem}>
          <SkeletonLoader height={16} width={20} style={{ marginRight: 8 }} />
          <SkeletonLoader height={16} width="85%" />
        </View>
        
        <View style={styles.questionItem}>
          <SkeletonLoader height={16} width={20} style={{ marginRight: 8 }} />
          <SkeletonLoader height={16} width="80%" />
        </View>
        
        <View style={styles.questionItem}>
          <SkeletonLoader height={16} width={20} style={{ marginRight: 8 }} />
          <SkeletonLoader height={16} width="75%" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  resultsContainer: {
    marginTop: 24,
    width: '100%',
    gap: 16,
  },
  headerCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  sourceTextContainer: {
    flex: 1,
  },
  assessmentCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  techniqueItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  techniqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  counterCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionsCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  embedContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickAssessmentContainer: {
    marginTop: 16,
  },
});