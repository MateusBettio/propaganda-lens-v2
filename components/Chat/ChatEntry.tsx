import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/theme-context';
import { ColorScheme } from '../../types';
import { fonts } from '../../constants/fonts';

interface ChatEntryProps {
  disabled?: boolean;
}

export function ChatEntry({ disabled = false }: ChatEntryProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handlePress = () => {
    if (!disabled) {
      router.push('/chat-demo');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.chatEntryButton,
        { backgroundColor: colors.surface, borderColor: colors.border },
        disabled && { opacity: 0.5 }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          Start AI Chat
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Ask questions, get instant analysis
        </Text>
      </View>
      
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    chatEntryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginBottom: 32,
      borderRadius: 16,
      borderWidth: 1,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontFamily: fonts.semiBold,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: fonts.regular,
    },
    arrowContainer: {
      marginLeft: 8,
    },
  });
}