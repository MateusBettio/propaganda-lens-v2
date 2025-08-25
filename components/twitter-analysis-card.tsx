import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../contexts/theme-context';

interface TwitterAnalysisCardProps {
  quickAssessment: string;
  embedHtml: string;
}

export function TwitterAnalysisCard({ quickAssessment, embedHtml }: TwitterAnalysisCardProps) {
  const { colors } = useTheme();

  const parseTweetType = () => {
    const tweetTypeMatch = quickAssessment.match(/^\[([A-Z]+)\]/);
    
    let tweetType = null;
    let cleanedAssessment = quickAssessment;
    
    if (tweetTypeMatch) {
      tweetType = tweetTypeMatch[1].toLowerCase();
      cleanedAssessment = quickAssessment.replace(/^\[([A-Z]+)\]\s*/, '');
    } else {
      const altMatch = quickAssessment.match(/^([A-Z]+):\s*(.*)$/i);
      if (altMatch) {
        tweetType = altMatch[1].toLowerCase();
        cleanedAssessment = altMatch[2];
      } else {
        const typeWords = ['humor', 'meme', 'serious', 'news', 'opinion'];
        for (const word of typeWords) {
          if (quickAssessment.toLowerCase().includes(word)) {
            tweetType = word;
            break;
          }
        }
      }
    }
    
    return { tweetType, cleanedAssessment };
  };

  const { tweetType, cleanedAssessment } = parseTweetType();

  return (
    <>
      <View style={styles.embedContainer}>
        <WebView
          source={{ 
            html: `
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
                ${embedHtml?.replace(/theme=light/g, `theme=${colors.background === '#121212' ? 'dark' : 'light'}`).replace(/&conversation=none/g, '&conversation=none&chrome=nofooter')}
              </body>
              </html>
            ` 
          }}
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
      
      <View style={styles.quickAssessmentContainer}>
        <TweetTypeBadge tweetType={tweetType} />
        <Text style={[styles.quickAssessmentText, { color: colors.textSecondary }]}>
          {cleanedAssessment}
        </Text>
      </View>
    </>
  );
}

function TweetTypeBadge({ tweetType }: { tweetType: string | null }) {
  const { colors } = useTheme();

  if (tweetType && ['humor', 'meme', 'serious', 'news', 'opinion', 'unknown'].includes(tweetType)) {
    const tweetTypeColors = {
      humor: { bg: colors.warning + '20', text: colors.warning, emoji: '😄' },
      meme: { bg: colors.primary + '20', text: colors.primary, emoji: '🎭' },
      serious: { bg: colors.textSecondary + '20', text: colors.textSecondary, emoji: '💼' },
      news: { bg: colors.error + '20', text: colors.error, emoji: '📰' },
      opinion: { bg: colors.success + '20', text: colors.success, emoji: '💭' },
      unknown: { bg: colors.border + '20', text: colors.textSecondary, emoji: '❓' }
    };
    const typeColor = tweetTypeColors[tweetType as keyof typeof tweetTypeColors] || tweetTypeColors.unknown;
    
    return (
      <View style={[styles.tweetTypeBadge, { backgroundColor: typeColor.bg }]}>
        <Text style={[styles.tweetTypeText, { color: typeColor.text }]}>
          {typeColor.emoji} {tweetType.toUpperCase()}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.tweetTypeBadge, { backgroundColor: colors.border + '20' }]}>
      <Text style={[styles.tweetTypeText, { color: colors.textSecondary }]}>
        🐦 TWEET
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  embedContainer: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 250,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  quickAssessmentContainer: {
    marginTop: 16,
  },
  tweetTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  tweetTypeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  quickAssessmentText: {
    fontSize: 16,
    lineHeight: 22,
  },
});