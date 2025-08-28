import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetFooter, BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button } from '../Button';
import { Send } from './Icons';
import { Variant } from './types';

interface FooterProps {
  variant: Variant;
  inputPlaceholder?: string;
  inputInitialValue?: string;
  onChangeInput?: (value: string) => void;
  onSubmitInput?: (value: string) => void;
  submitLabel?: string;
}

const FooterComponent: React.FC<FooterProps> = React.memo(({
  variant,
  inputPlaceholder = 'Enter URL or text to analyze...',
  inputInitialValue = '',
  onChangeInput,
  onSubmitInput,
  submitLabel = 'Send',
}) => {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState(inputInitialValue);
  const isLoading = variant === 'loading';

  const handleChange = useCallback((text: string) => {
    setInputValue(text);
    onChangeInput?.(text);
  }, [onChangeInput]);

  const handleSubmit = useCallback(() => {
    if (inputValue.trim() && !isLoading) {
      onSubmitInput?.(inputValue.trim());
    }
  }, [inputValue, isLoading, onSubmitInput]);

  return (
    <Animated.View 
      entering={FadeIn.duration(300)}
      style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={inputPlaceholder}
          placeholderTextColor="#9CA3AF"
          value={inputValue}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
          multiline={false}
          editable={!isLoading}
          testID="analysis-input"
        />
        <Button
          variant="primary"
          size="medium"
          title={submitLabel}
          icon="send"
          iconPosition="left"
          onPress={handleSubmit}
          disabled={!inputValue.trim() || isLoading}
          loading={isLoading}
          style={styles.submitButton}
        />
      </View>
    </Animated.View>
  );
});

export const createFooterComponent = (props: FooterProps) => {
  return (footerProps: BottomSheetFooterProps) => (
    <BottomSheetFooter {...footerProps} bottomInset={0}>
      <FooterComponent {...props} />
    </BottomSheetFooter>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#FFFFFFD9',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  submitButton: {
    minWidth: 100,
  },
});