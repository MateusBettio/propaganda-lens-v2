import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ScrollView, Text, Platform } from 'react-native';
// Removed BlurView import - no longer using blur effects
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { fonts } from '../../constants/fonts';

interface ChatInputLightProps {
  disabled?: boolean;
  placeholder?: string;
  onSubmit?: (message: string) => void;
  showPrompts?: boolean;
}

const PROMPT_SUGGESTIONS = [
  "What propaganda techniques are here?",
  "Explain the bias in this content",
  "Is this misinformation?",
  "Check facts in this article",
  "Analyze emotional manipulation",
  "Find logical fallacies",
  "Rate credibility",
  "Show counter-arguments"
];

// Light theme colors with less transparency
const lightColors = {
  background: 'rgba(255, 255, 255, 0.95)',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: 'rgba(209, 213, 219, 0.8)',
  primary: '#3b82f6',
  surface: 'rgba(249, 250, 251, 0.9)',
};

export function ChatInputLight({
  disabled = false,
  placeholder = "Ask questions, get instant analysis...",
  onSubmit,
  showPrompts = true
}: ChatInputLightProps) {
  const styles = createStyles();
  const [message, setMessage] = useState('');

  const handleSubmit = (text?: string) => {
    const messageToSend = text || message;
    if (messageToSend.trim() && !disabled) {
      // Always call onSubmit if provided (for analysis sheet)
      // Only navigate to chat-demo if no onSubmit handler
      if (onSubmit) {
        onSubmit(messageToSend.trim());
        setMessage('');
      } else {
        router.push({
          pathname: '/chat-demo',
          params: { initialMessage: messageToSend.trim() }
        });
        setMessage('');
      }
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSubmit(suggestion);
  };

  return (
    <View style={styles.wrapper}>
      {showPrompts && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsContainer}
          contentContainerStyle={styles.suggestionsContent}
        >
          {PROMPT_SUGGESTIONS.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.suggestionBadgeContainer, disabled && { opacity: 0.5 }]}
              onPress={() => handleSuggestionPress(suggestion)}
              activeOpacity={0.7}
              disabled={disabled}
            >
              <View style={styles.suggestionBadge}>
                <Text style={styles.suggestionText}>
                  {suggestion}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={[styles.inputContainer, disabled && { opacity: 0.5 }]}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubble-outline" size={20} color={lightColors.text} />
          </View>

          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={lightColors.textSecondary}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={() => handleSubmit()}
            returnKeyType="send"
            editable={!disabled}
            multiline={false}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled
            ]}
            onPress={() => handleSubmit()}
            disabled={!message.trim() || disabled}
            activeOpacity={0.7}
          >
            <Ionicons
              name="send"
              size={20}
              color={message.trim() ? lightColors.primary : lightColors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    wrapper: {
      marginBottom: 32,
    },
    suggestionsContainer: {
      marginBottom: 12,
      maxHeight: 40,
      marginHorizontal: -20, // Extend beyond parent's padding to reach screen edges
    },
    suggestionsContent: {
      flexDirection: 'row',
      paddingHorizontal: 20, // Add padding back for proper spacing from screen edges
    },
    suggestionBadgeContainer: {
      marginRight: 8,
      flexShrink: 0,
      borderRadius: 20,
      overflow: 'hidden',
    },
    suggestionBadge: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: lightColors.border,
      backdropFilter: 'blur(10px)',
    },
    suggestionText: {
      fontSize: 14,
      fontFamily: fonts.regular,
      color: lightColors.text,
    },
    inputContainer: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: lightColors.border,
      backdropFilter: 'blur(10px)',
    },
    iconContainer: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontFamily: fonts.regular,
      paddingVertical: 4,
      color: lightColors.text,
    },
    sendButton: {
      padding: 8,
      marginLeft: 8,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });
}