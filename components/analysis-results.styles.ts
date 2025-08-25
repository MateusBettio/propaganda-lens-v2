import { StyleSheet } from 'react-native';
import { ColorScheme } from '../types';

export function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    resultsContainer: {
      marginTop: 24,
      width: '100%',
      gap: 16,
    },
  });
}