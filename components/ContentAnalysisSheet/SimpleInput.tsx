import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SimpleInputProps {
  placeholder?: string;
  onSubmit?: (value: string) => void;
}

export const SimpleInput: React.FC<SimpleInputProps> = React.memo(({
  placeholder = "Ask about the content...",
  onSubmit,
}) => {
  const [value, setValue] = useState('');
  const insets = useSafeAreaInsets();

  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={setValue}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
        />
        <Pressable
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={!value.trim()}
        >
          <Ionicons 
            name="chevron-up" 
            size={20} 
            color={value.trim() ? "#6366F1" : "#9CA3AF"} 
          />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
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