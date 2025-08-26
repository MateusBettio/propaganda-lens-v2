import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { ColorScheme } from '../types';

interface CardProps {
  variant?: 'default' | 'header' | 'techniques' | 'assessment';
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ variant = 'default', title, children, style }: CardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.card, styles[variant], style]}>
      {title && (
        <Text style={styles.title}>{title}</Text>
      )}
      {children}
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    default: {},
    header: {
      marginBottom: 20,
    },
    techniques: {
      padding: 20,
    },
    assessment: {
      padding: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
  });
}