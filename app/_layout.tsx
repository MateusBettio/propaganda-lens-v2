import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../contexts/theme-context';
import { Platform } from 'react-native';

function AppStack() {
  const { colors } = useTheme();
  
  useEffect(() => {
    const handleUrl = (url: string) => {
      console.log('Received share:', url);
      // TODO: Pass this to the home screen
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Fix viewport for web platform
    if (Platform.OS === 'web') {
      // Override viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      
      // Add CSS to prevent zoom
      const style = document.createElement('style');
      style.innerHTML = `
        html, body, #root {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: hidden !important;
          touch-action: manipulation !important;
        }
        input, textarea, select {
          font-size: 16px !important;
          -webkit-appearance: none;
        }
        * {
          -webkit-text-size-adjust: 100% !important;
          -ms-text-size-adjust: 100% !important;
          text-size-adjust: 100% !important;
        }
      `;
      document.head.appendChild(style);
      
      // Prevent double-tap zoom
      let lastTouchEnd = 0;
      document.addEventListener('touchend', function (event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }, false);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppStack />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}