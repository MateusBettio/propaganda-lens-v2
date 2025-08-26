import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/theme-context';
import { ColorScheme } from '../types';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
}

export function ErrorMessage({ 
  title = 'Analysis could not be completed', 
  message, 
  variant = 'error',
  onDismiss
}: ErrorMessageProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors, variant);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={onDismiss}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="close" 
              size={20} 
              color={styles.title.color}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function createStyles(colors: ColorScheme, variant: 'error' | 'warning' | 'info') {
  const variantColors = {
    error: colors.error,
    warning: colors.warning,
    info: colors.primary,
  };

  const borderColor = variantColors[variant];

  return StyleSheet.create({
    container: {
      backgroundColor: borderColor + '15',
      borderLeftWidth: 4,
      borderLeftColor: borderColor,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    textContainer: {
      flex: 1,
      paddingRight: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: borderColor,
      marginBottom: 8,
    },
    message: {
      fontSize: 14,
      lineHeight: 20,
      color: borderColor,
    },
    dismissButton: {
      padding: 4,
      borderRadius: 12,
      backgroundColor: 'transparent',
    },
  });
}