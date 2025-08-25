import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { StyleSheet } from 'react-native';
import { ColorScheme } from '../types';

interface TwitterEmbedProps {
  embedHtml: string;
  colors: ColorScheme;
}

export function TwitterEmbed({ embedHtml, colors }: TwitterEmbedProps) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; }
        html, body { 
          width: 100%;
          background-color: ${colors.card};
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .twitter-tweet {
          margin: 0 auto !important;
          max-width: 100% !important;
        }
        iframe {
          width: 100%;
          height: 250px;
          border: none;
        }
      </style>
    </head>
    <body>
      ${embedHtml
        .replace(/theme=light/g, `theme=${colors.background === '#121212' ? 'dark' : 'light'}`)
        .replace(/&conversation=none/g, '&conversation=none&chrome=nofooter')
      }
    </body>
    </html>
  `;

  return (
    <View style={styles.embedContainer}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  embedContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webView: {
    height: 260,
    backgroundColor: 'transparent',
    width: '100%',
  },
});