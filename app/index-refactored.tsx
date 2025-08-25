import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useAnalysis } from '../hooks/use-analysis';
import { detectContentType } from '../utils/content-detector';
import { useTheme } from '../contexts/theme-context';
import { HeaderSection } from '../components/header-section';
import { InputSection } from '../components/input-section';
import { LoadingErrorSection } from '../components/loading-error-section';
import { AnalysisResults } from '../components/analysis-results';
import { isValidURL } from '../components/url-validation';

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
    setValidationError('');
    
    if (autoAnalyzeTimeoutRef.current) {
      clearTimeout(autoAnalyzeTimeoutRef.current);
    }
    
    const trimmedText = text.trim();
    if (trimmedText && isValidURL(trimmedText) && !loading && trimmedText !== lastAnalyzedUrlRef.current) {
      autoAnalyzeTimeoutRef.current = setTimeout(() => {
        handleAnalyze();
      }, 500);
    }
  };

  useEffect(() => {
    if (loading) {
      contentOpacity.setValue(0);
      Animated.timing(skeletonOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (result && !error) {
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
      skeletonOpacity.setValue(0);
      contentOpacity.setValue(0);
    }
  }, [loading, result, error, skeletonOpacity, contentOpacity]);

  useEffect(() => {
    return () => {
      if (autoAnalyzeTimeoutRef.current) {
        clearTimeout(autoAnalyzeTimeoutRef.current);
      }
    };
  }, []);

  const handleAnalyze = async () => {
    const contentToAnalyze = inputContent.trim();
    
    if (!contentToAnalyze) {
      setValidationError('Please enter a URL to analyze');
      return;
    }
    
    if (!isValidURL(contentToAnalyze)) {
      setValidationError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }
    
    setValidationError('');
    lastAnalyzedUrlRef.current = contentToAnalyze;
    
    try {
      const contentType = detectContentType(contentToAnalyze);
      console.log('Analyzing URL:', contentToAnalyze);
      await analyze(contentToAnalyze, contentType);
    } catch (err) {
      console.error('Analysis error:', err);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection />
      
      <InputSection 
        inputContent={inputContent}
        onInputChange={handleInputChange}
        onAnalyze={handleAnalyze}
        loading={loading}
        validationError={validationError}
      />

      <LoadingErrorSection 
        loading={loading}
        error={error}
        inputContent={inputContent}
        skeletonOpacity={skeletonOpacity}
      />
      
      {result && !error && (
        <AnalysisResults 
          result={result} 
          contentOpacity={contentOpacity}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 60,
  },
});