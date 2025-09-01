import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

interface StyledTextProps extends TextProps {
  variant?: 'regular' | 'medium' | 'semibold' | 'bold';
  italic?: boolean;
}

export function Text({ style, variant = 'regular', italic = false, ...props }: StyledTextProps) {
  const fontFamily = getFontFamily(variant, italic);
  return <RNText {...props} style={[styles.base, { fontFamily }, style]} />;
}

function getFontFamily(variant: string, italic: boolean): string {
  const baseFont = 'InstrumentSans_';
  const weight = {
    regular: '400Regular',
    medium: '500Medium',
    semibold: '600SemiBold',
    bold: '700Bold'
  }[variant] || '400Regular';
  
  return `${baseFont}${weight}${italic ? '_Italic' : ''}`;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'InstrumentSans_400Regular',
  }
});

export default Text;