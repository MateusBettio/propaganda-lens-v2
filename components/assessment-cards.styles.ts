import { StyleSheet } from 'react-native';
import { ColorScheme } from '../types';

export function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    assessmentCard: {
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
    assessmentText: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
    },
    counterCard: {
      padding: 20,
      borderRadius: 16,
      borderLeftWidth: 4,
      backgroundColor: colors.success + '15',
      borderLeftColor: colors.success,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    counterText: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
    },
    questionsCard: {
      padding: 20,
      borderRadius: 16,
      borderLeftWidth: 4,
      backgroundColor: colors.warning + '15',
      borderLeftColor: colors.warning,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    questionItem: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    questionNumber: {
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
      minWidth: 20,
      color: colors.warning,
    },
    questionText: {
      fontSize: 16,
      lineHeight: 24,
      flex: 1,
      color: colors.textSecondary,
    },
  });
}