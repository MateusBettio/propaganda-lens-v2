import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, DimensionValue } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { ColorScheme } from '../types';

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: any;
}

function SkeletonLoader({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonLoaderProps) {
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
    <View style={[
      { width, height, borderRadius, backgroundColor: colors.border, overflow: 'hidden' },
      style
    ]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.surface, opacity, borderRadius }
        ]}
      />
    </View>
  );
}

export function AnalysisSkeleton() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header Card Skeleton */}
      <View style={styles.card}>
        <SkeletonLoader height={24} width="60%" style={{ marginBottom: 16 }} />
        <SkeletonLoader height={120} borderRadius={12} style={{ marginBottom: 16 }} />
        <SkeletonLoader height={20} width="100%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={20} width="85%" />
      </View>

      {/* Assessment Card Skeleton */}
      <View style={styles.card}>
        <SkeletonLoader height={18} width="45%" style={{ marginBottom: 12 }} />
        <SkeletonLoader height={16} width="100%" style={{ marginBottom: 6 }} />
        <SkeletonLoader height={16} width="95%" style={{ marginBottom: 6 }} />
        <SkeletonLoader height={16} width="85%" />
      </View>

      {/* Techniques Card Skeleton */}
      <View style={styles.card}>
        <SkeletonLoader height={18} width="50%" style={{ marginBottom: 16 }} />
        {[...Array(2)].map((_, index) => (
          <View key={index} style={styles.techniqueItem}>
            <View style={styles.techniqueHeader}>
              <SkeletonLoader height={16} width="40%" />
              <SkeletonLoader height={20} width={60} borderRadius={10} />
            </View>
            <SkeletonLoader height={14} width="95%" style={{ marginTop: 8, marginBottom: 4 }} />
            <SkeletonLoader height={14} width="80%" />
          </View>
        ))}
      </View>

      {/* Counter Perspective Card */}
      <View style={styles.card}>
        <SkeletonLoader height={18} width="40%" style={{ marginBottom: 12 }} />
        <SkeletonLoader height={16} width="100%" style={{ marginBottom: 6 }} />
        <SkeletonLoader height={16} width="90%" />
      </View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: {
      marginTop: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    techniqueItem: {
      backgroundColor: colors.surface,
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
}