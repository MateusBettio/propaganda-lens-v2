import { StyleSheet } from 'react-native';
import { ColorScheme } from '../types';

export function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    headerCard: {
      padding: 20,
      borderRadius: 16,
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    resultTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 4,
      color: colors.text,
    },
    sourceContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 8,
    },
    thumbnail: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: '#f0f0f0',
    },
    sourceTextContainer: {
      flex: 1,
    },
    sourceText: {
      fontSize: 14,
      fontStyle: 'italic',
      marginBottom: 4,
      color: colors.textSecondary,
    },
    sourceTitle: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
      color: colors.text,
    },
  });
}