import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useAnalysis } from '../hooks/use-analysis';
import { detectContentType } from '../utils/content-detector';
import { useTheme } from '../contexts/theme-context';
import { ThemeSwitcher } from '../components/theme-switcher';
import { Logo } from '../components/logo';
import { TwitterSkeleton, WebpageSkeleton } from '../components/skeleton-loader';
import { AnalysisResults } from '../components/analysis-results';

// URL validation function
function isValidURL(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
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
          <Logo width={200} />
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
        <AnalysisResults result={result} contentOpacity={contentOpacity} />
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
});