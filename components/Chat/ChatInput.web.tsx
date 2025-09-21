import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/theme-context';
import { ColorScheme } from '../../types';
import { fonts } from '../../constants/fonts';

interface ChatInputProps {
  disabled?: boolean;
  placeholder?: string;
  onSubmit?: (message: string) => void;
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

export function ChatInput({
  disabled = false,
  placeholder = "Ask questions, get instant analysis...",
  onSubmit
}: ChatInputProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (text?: string) => {
    const messageToSend = text || message;
    if (messageToSend.trim() && !disabled) {
      if (onSubmit) {
        onSubmit(messageToSend.trim());
      } else {
        router.push({
          pathname: '/chat-demo',
          params: { initialMessage: messageToSend.trim() }
        });
      }
      if (!text) {
        setMessage('');
      }
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSubmit(suggestion);
  };

  useEffect(() => {
    if (scrollRef.current) {
      const element = scrollRef.current as any;
      element.style.overflowX = 'auto';
      element.style.overflowY = 'hidden';
      element.style.scrollbarWidth = 'none';
      element.style.msOverflowStyle = 'none';
      element.style.webkitScrollbar = 'none';

      const style = document.createElement('style');
      style.innerHTML = `
        .suggestions-scroll::-webkit-scrollbar {
          display: none;
        }
      `;
      document.head.appendChild(style);
      element.className = 'suggestions-scroll';
    }
  }, []);

  return (
    <View style={styles.wrapper}>
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          overflowY: 'hidden',
          marginBottom: 12,
          paddingBottom: 4,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {PROMPT_SUGGESTIONS.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.suggestionBadge,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
            onPress={() => handleSuggestionPress(suggestion)}
            activeOpacity={0.7}
            disabled={disabled}
          >
            <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </div>

      <View style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
        disabled && { opacity: 0.5 }
      ]}>
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
        </View>

        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
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
            color={message.trim() ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    wrapper: {
      marginBottom: 32,
    },
    suggestionBadge: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      marginRight: 8,
      flexShrink: 0,
      whiteSpace: 'nowrap' as any,
    },
    suggestionText: {
      fontSize: 14,
      fontFamily: fonts.regular,
      whiteSpace: 'nowrap' as any,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    iconContainer: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontFamily: fonts.regular,
      paddingVertical: 4,
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