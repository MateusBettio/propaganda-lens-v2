import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { ColorScheme } from '../types';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  hasError?: boolean;
  style?: ViewStyle;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  hasError = false,
  style
}: InputProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors, hasError);

  return (
    <TextInput
      style={[styles.input, style]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      multiline={multiline}
      numberOfLines={numberOfLines}
      editable={editable}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  );
}

function createStyles(colors: ColorScheme, hasError: boolean) {
  return StyleSheet.create({
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: hasError ? colors.error : colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      marginBottom: 8,
    },
  });
}