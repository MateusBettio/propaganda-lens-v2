import React, { useState } from 'react';
import { StyleSheet, Pressable, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

interface BottomSectionProps {
  placeholder?: string;
  onSubmit?: (value: string) => void;
  animatedStyle?: any;
}

export const BottomSection: React.FC<BottomSectionProps> = React.memo(({
  placeholder = "Ask about the content...",
  onSubmit,
  animatedStyle,
}) => {
  const [inputValue, setInputValue] = useState('');
  const insets = useSafeAreaInsets();

  const handleSubmit = () => {
    if (inputValue.trim() && onSubmit) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <Animated.View style={[styles.container, { paddingBottom: insets.bottom + 16 }, animatedStyle]}>
      <Animated.View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
        />
        <Pressable
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={!inputValue.trim()}
        >
          <Ionicons 
            name="arrow-up" 
            size={20} 
            color={inputValue.trim() ? "#6366F1" : "#9CA3AF"} 
          />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 4 : 0,
    zIndex: 1001,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  submitButton: {
    marginLeft: 8,
    padding: 4,
  },
});