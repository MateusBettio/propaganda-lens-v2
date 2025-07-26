import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Pressable, Image, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { useAnalysis } from '../hooks/use-analysis';
import { detectContentType } from '../utils/content-detector';
import { useTheme } from '../contexts/theme-context';
import { ThemeSwitcher } from '../components/theme-switcher';
import { Logo } from '../components/logo';
import { TwitterSkeleton, WebpageSkeleton } from '../components/skeleton-loader';

// URL validation function
function isValidURL(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Localization helpers for UI strings
function getLocalizedResultTitle(language: string): string {
  const titles = {
    'en': 'Analysis Complete',
    'pt-br': 'Análise Concluída',
    'es': 'Análisis Completado'
  };
  return titles[language as keyof typeof titles] || titles['en'];
}

function getLocalizedString(key: string, language: string): string {
  const strings: Record<string, Record<string, string>> = {
    'quick_assessment': {
      'en': 'Quick Assessment',
      'pt-br': 'Avaliação Rápida',
      'es': 'Evaluación Rápida'
    },
    'techniques_detected': {
      'en': 'Propaganda Techniques Detected',
      'pt-br': 'Técnicas de Propaganda Detectadas',
      'es': 'Técnicas de Propaganda Detectadas'
    },
    'alternative_perspective': {
      'en': 'Alternative Perspective',
      'pt-br': 'Perspectiva Alternativa',
      'es': 'Perspectiva Alternativa'
    },
    'critical_thinking': {
      'en': 'Critical Thinking Questions',
      'pt-br': 'Perguntas de Pensamento Crítico',
      'es': 'Preguntas de Pensamiento Crítico'
    }
  };
  
  return strings[key]?.[language] || strings[key]?.['en'] || key;
}

export default function HomeScreen() {
  const [inputContent, setInputContent] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const { loading, error, result, analyze } = useAnalysis();
  const { colors } = useTheme();
  const autoAnalyzeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalyzedUrlRef = useRef<string>('');
  const skeletonOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const handleInputChange = (text: string) => {
    setInputContent(text);
    setValidationError(''); // Clear validation error when user types
    
    // Clear any existing timeout
    if (autoAnalyzeTimeoutRef.current) {
      clearTimeout(autoAnalyzeTimeoutRef.current);
    }
    
    // Auto-analyze if a valid URL is pasted (but not if we're already loading or if it's the same URL)
    const trimmedText = text.trim();
    if (trimmedText && isValidURL(trimmedText) && !loading && trimmedText !== lastAnalyzedUrlRef.current) {
      // Debounce the auto-analysis to avoid multiple triggers
      autoAnalyzeTimeoutRef.current = setTimeout(() => {
        handleAnalyze();
      }, 500); // 500ms delay to ensure user is done pasting/typing
    }
  };

  // Handle loading animations
  useEffect(() => {
    if (loading) {
      // Show skeleton with fade in
      contentOpacity.setValue(0);
      Animated.timing(skeletonOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (result && !error) {
      // Fade out skeleton and fade in content
      Animated.sequence([
        Animated.timing(skeletonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations if there's an error or no result
      skeletonOpacity.setValue(0);
      contentOpacity.setValue(0);
    }
  }, [loading, result, error, skeletonOpacity, contentOpacity]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoAnalyzeTimeoutRef.current) {
        clearTimeout(autoAnalyzeTimeoutRef.current);
      }
    };
  }, []);

  const handleAnalyze = async () => {
    const contentToAnalyze = inputContent.trim();
    
    // Validation: require URL
    if (!contentToAnalyze) {
      setValidationError('Please enter a URL to analyze');
      return;
    }
    
    if (!isValidURL(contentToAnalyze)) {
      setValidationError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }
    
    // Clear validation error if we get here
    setValidationError('');
    
    // Update the last analyzed URL to prevent duplicate auto-analysis
    lastAnalyzedUrlRef.current = contentToAnalyze;
    
    try {
      const contentType = detectContentType(contentToAnalyze);
      console.log('Analyzing URL:', contentToAnalyze);
      await analyze(contentToAnalyze, contentType);
    } catch (err) {
      console.error('Analysis error:', err);
    }
  };

  // Check if input is valid for button state
  const isInputValid = inputContent.trim() && isValidURL(inputContent.trim());

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Logo width={240} />
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Paste a URL to auto-analyze</Text>
        </View>
        <ThemeSwitcher />
      </View>
      
      <TextInput
        style={[
          styles.textInput,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          validationError ? { borderColor: colors.error } : null
        ]}
        multiline
        numberOfLines={3}
        placeholder="Paste a URL here for instant analysis..."
        placeholderTextColor={colors.textSecondary}
        value={inputContent}
        onChangeText={handleInputChange}
        editable={!loading}
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      {validationError ? (
        <View style={[styles.validationBox, { backgroundColor: colors.error + '15', borderLeftColor: colors.error }]}>
          <Text style={[styles.validationText, { color: colors.error }]}>{validationError}</Text>
        </View>
      ) : null}
      
      <TouchableOpacity 
        style={[styles.analyzeButton, { backgroundColor: colors.primary }, (!isInputValid || loading) && { backgroundColor: colors.textSecondary }]}
        onPress={handleAnalyze}
        disabled={loading || !isInputValid}
      >
        <Text style={[styles.analyzeButtonText, (!isInputValid || loading) && { color: colors.background }]}>
          {loading ? "Analyzing..." : "Manual Analysis"}
        </Text>
      </TouchableOpacity>

      {loading && (
        <Animated.View style={{ opacity: skeletonOpacity }}>
          {(() => {
            const contentType = detectContentType(inputContent.trim());
            return contentType === 'twitter' ? <TwitterSkeleton /> : <WebpageSkeleton />;
          })()}
        </Animated.View>
      )}
      
      {error && (
        <View style={[styles.errorBox, { backgroundColor: colors.error + '15', borderLeftColor: colors.error }]}>
          <Text style={[styles.errorHeading, { color: colors.error }]}>Analysis could not be completed</Text>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}
      
      {result && !error && (
        <Animated.View style={[styles.resultsContainer, { opacity: contentOpacity }]}>
          {/* Header Card */}
          <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.resultTitle, { color: colors.text }]}>
              {getLocalizedResultTitle(result.language || 'en')}
            </Text>
            
            {/* Embedded Tweet Display */}
            {result.sourceInfo?.extractedData?.embedHtml && result.sourceInfo?.extractedData?.type === 'twitter' && (
              <View style={styles.embedContainer}>
                <WebView
                  source={{ html: `
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
                      ${result.sourceInfo.extractedData.embedHtml?.replace(/theme=light/g, `theme=${colors.background === '#121212' ? 'dark' : 'light'}`).replace(/&conversation=none/g, '&conversation=none&chrome=nofooter')}
                    </body>
                    </html>
                  ` }}
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
            )}
            
            {/* Quick Assessment for Twitter - shown in header card */}
            {result.sourceInfo?.extractedData?.type === 'twitter' && result.quickAssessment && (
              <View style={styles.quickAssessmentContainer}>
                {(() => {
                  console.log('DEBUG: quickAssessment for Twitter:', result.quickAssessment);
                  console.log('DEBUG: First 50 chars:', result.quickAssessment.substring(0, 50));
                  
                  // Look specifically for [TYPE] pattern at the start
                  const tweetTypeMatch = result.quickAssessment.match(/^\[([A-Z]+)\]/);
                  console.log('DEBUG: tweetTypeMatch:', tweetTypeMatch);
                  
                  let tweetType = null;
                  let cleanedAssessment = result.quickAssessment;
                  
                  if (tweetTypeMatch) {
                    tweetType = tweetTypeMatch[1].toLowerCase();
                    cleanedAssessment = result.quickAssessment.replace(/^\[([A-Z]+)\]\s*/, '');
                  } else {
                    // Try alternative patterns
                    const altMatch = result.quickAssessment.match(/^([A-Z]+):\s*(.*)$/i);
                    console.log('DEBUG: altMatch (TYPE: format):', altMatch);
                    
                    if (altMatch) {
                      tweetType = altMatch[1].toLowerCase();
                      cleanedAssessment = altMatch[2];
                    } else {
                      // Try to find type words in the text
                      const typeWords = ['humor', 'meme', 'serious', 'news', 'opinion'];
                      for (const word of typeWords) {
                        if (result.quickAssessment.toLowerCase().includes(word)) {
                          tweetType = word;
                          break;
                        }
                      }
                    }
                  }
                  
                  console.log('DEBUG: Final tweetType:', tweetType);
                  console.log('DEBUG: cleanedAssessment:', cleanedAssessment.substring(0, 50));
                  
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
                      <View>
                        <View style={[styles.tweetTypeBadge, { backgroundColor: typeColor.bg }]}>
                          <Text style={[styles.tweetTypeText, { color: typeColor.text }]}>
                            {typeColor.emoji} {tweetType.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={[styles.quickAssessmentText, { color: colors.textSecondary }]}>{cleanedAssessment}</Text>
                      </View>
                    );
                  } else {
                    // Fallback: show a generic classification badge for Twitter content
                    return (
                      <View>
                        <View style={[styles.tweetTypeBadge, { backgroundColor: colors.border + '20' }]}>
                          <Text style={[styles.tweetTypeText, { color: colors.textSecondary }]}>
                            🐦 TWEET
                          </Text>
                        </View>
                        <Text style={[styles.quickAssessmentText, { color: colors.textSecondary }]}>{result.quickAssessment}</Text>
                      </View>
                    );
                  }
                })()}
              </View>
            )}
            
            {/* Source info for non-Twitter content only */}
            {result.sourceInfo && result.sourceInfo.extractedData?.type !== 'twitter' && (
              <View style={styles.sourceContainer}>
                {result.sourceInfo.extractedData?.thumbnail && (
                  <Image source={{ uri: result.sourceInfo.extractedData.thumbnail }} style={styles.thumbnail} />
                )}
                <View style={styles.sourceTextContainer}>
                  <Text style={[styles.sourceText, { color: colors.textSecondary }]}>Source: {new URL(result.sourceInfo.sourceUrl).hostname}</Text>
                  {result.sourceInfo.extractedData?.title && (
                    <Text style={[styles.sourceTitle, { color: colors.text }]} numberOfLines={2}>{result.sourceInfo.extractedData.title}</Text>
                  )}
                </View>
              </View>
            )}
          </View>


          {/* Assessment Card - Only for non-Twitter content */}
          {result.sourceInfo?.extractedData?.type !== 'twitter' && (
            <View style={[styles.assessmentCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {getLocalizedString('quick_assessment', result.language || 'en')}
              </Text>
              <Text style={[styles.assessmentText, { color: colors.textSecondary }]}>{result.quickAssessment}</Text>
            </View>
          )}
          
          {/* Techniques Card */}
          {result.techniques && result.techniques.length > 0 && (
            <View style={[styles.techniquesCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {getLocalizedString('techniques_detected', result.language || 'en')} ({result.techniques.length})
              </Text>
              {result.techniques.map((technique, index) => {
                console.log(`Technique ${index}:`, JSON.stringify(technique, null, 2));
                return (
                  <Pressable key={index} style={[styles.techniqueItem, { backgroundColor: colors.surface }]}>
                    <View style={styles.techniqueHeader}>
                      <Text style={[styles.techniqueName, { color: colors.text }]}>{technique.name}</Text>
                      <View style={[
                        styles.confidenceBadge,
                        technique.confidence === 'high' ? styles.confidenceHigh :
                        technique.confidence === 'medium' ? styles.confidenceMedium : styles.confidenceLow
                      ]}>
                        <Text style={styles.confidenceText}>{technique.confidence}</Text>
                      </View>
                    </View>
                    <Text style={[styles.techniqueDescription, { color: colors.textSecondary }]}>{technique.description}</Text>
                    {technique.example && technique.example.trim() && (
                      <View style={[styles.exampleContainer, { backgroundColor: colors.surface, borderLeftColor: colors.border }]}>
                        <Text style={[styles.exampleLabel, { color: colors.textSecondary }]}>Example:</Text>
                        <Text style={[styles.exampleText, { color: colors.text }]}>"{technique.example}"</Text>
                      </View>
                    )}
                    {/* Debug info */}
                    {__DEV__ && (
                      <Text style={{ fontSize: 10, color: 'red' }}>
                        Example: {technique.example ? `"${technique.example}"` : 'null/undefined'}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Counter Perspective Card */}
          {result.counterPerspective && (
            <View style={[styles.counterCard, { backgroundColor: colors.success + '15', borderLeftColor: colors.success }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {getLocalizedString('alternative_perspective', result.language || 'en')}
              </Text>
              <Text style={[styles.counterText, { color: colors.textSecondary }]}>{result.counterPerspective}</Text>
            </View>
          )}

          {/* Questions Card */}
          {result.reflectionQuestions && result.reflectionQuestions.length > 0 && (
            <View style={[styles.questionsCard, { backgroundColor: colors.warning + '15', borderLeftColor: colors.warning }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {getLocalizedString('critical_thinking', result.language || 'en')}
              </Text>
              {result.reflectionQuestions.map((question, index) => (
                <View key={index} style={styles.questionItem}>
                  <Text style={[styles.questionNumber, { color: colors.warning }]}>{index + 1}.</Text>
                  <Text style={[styles.questionText, { color: colors.textSecondary }]}>{question}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: 'top',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  validationBox: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    width: '100%',
  },
  validationText: {
    fontSize: 14,
  },
  analyzeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    marginBottom: 16,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginTop: 20,
    transform: [{ scale: 1.2 }],
  },
  errorBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    width: '100%',
  },
  errorHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resultsContainer: {
    marginTop: 24,
    width: '100%',
    gap: 16,
  },
  headerCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  sourceTextContainer: {
    flex: 1,
  },
  sourceText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  assessmentCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  assessmentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  techniquesCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  techniqueItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  techniqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  techniqueName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  confidenceHigh: { backgroundColor: '#dcfce7' },
  confidenceMedium: { backgroundColor: '#fef3c7' },
  confidenceLow: { backgroundColor: '#fee2e2' },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  techniqueDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  exampleContainer: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 2,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  exampleText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  counterCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  counterText: {
    fontSize: 16,
    lineHeight: 24,
  },
  questionsCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    minWidth: 20,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
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
  tweetTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  tweetTypeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickAssessmentContainer: {
    marginTop: 16,
  },
  quickAssessmentText: {
    fontSize: 16,
    lineHeight: 24,
  },
});