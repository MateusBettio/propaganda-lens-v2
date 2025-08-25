import { StyleSheet } from 'react-native';
import { ColorScheme } from '../types';

export function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    techniquesCard: {
      padding: 20,
      borderRadius: 16,
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
      color: colors.text,
    },
    techniqueItem: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#3b82f6',
      backgroundColor: colors.surface,
    },
    techniqueHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    techniqueName: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
      color: colors.text,
    },
    confidenceBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    confidenceHigh: { backgroundColor: '#dcfce7' },
    confidenceMedium: { backgroundColor: '#fef3c7' },
    confidenceLow: { backgroundColor: '#fee2e2' },
    confidenceText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    techniqueDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 8,
      color: colors.textSecondary,
    },
    exampleContainer: {
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 2,
      backgroundColor: colors.surface,
      borderLeftColor: colors.border,
    },
    exampleLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    exampleText: {
      fontSize: 13,
      fontStyle: 'italic',
      lineHeight: 18,
      color: colors.text,
    },
  });
}