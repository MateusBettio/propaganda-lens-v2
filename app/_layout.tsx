import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

export default function RootLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Propaganda Lens' }} />
    </Stack>
  );
}