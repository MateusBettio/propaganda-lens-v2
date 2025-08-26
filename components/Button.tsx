import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { ColorScheme } from '../types';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ 
  variant = 'primary', 
  size = 'medium',
  onPress, 
  disabled = false,
  loading = false,
  children, 
  style,
  textStyle 
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        styles[variant], 
        styles[size],
        isDisabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.text,
        styles[`${variant}Text`],
        isDisabled && styles.disabledText,
        textStyle
      ]}>
        {loading ? 'Loading...' : children}
      </Text>
    </TouchableOpacity>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    button: {
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
      minHeight: 44,
    },
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    medium: {
      paddingVertical: 16,
      paddingHorizontal: 24,
    },
    large: {
      paddingVertical: 20,
      paddingHorizontal: 32,
    },
    disabled: {
      backgroundColor: colors.textSecondary,
      borderColor: colors.textSecondary,
    },
    text: {
      fontSize: 16,
      fontWeight: '600',
    },
    primaryText: {
      color: colors.primary === colors.white ? colors.black : colors.white,
    },
    secondaryText: {
      color: colors.text,
    },
    outlineText: {
      color: colors.primary,
    },
    disabledText: {
      color: colors.background,
    },
  });
}