import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ChatScreen } from '../components/Chat';
import { useTheme } from '../contexts/theme-context';

export default function ChatDemoScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const initialMessage = params.initialMessage as string;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ChatScreen
        aiApiKey={process.env.EXPO_PUBLIC_OPENAI_API_KEY}
        aiModel="gpt-3.5-turbo"
        enableImages={true}
        initialUserMessage={initialMessage}
        onSendMessage={(message) => {
          console.log('Message sent:', message);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});