import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { fonts } from '../constants/fonts';

export function ThemeSwitcher() {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]} 
      onPress={toggleTheme}
    >
      <Text style={[styles.text, { color: colors.text }]}>
        {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Dark' : 'Light'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    height: 44,
    minHeight: 44,
  },
  text: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
});