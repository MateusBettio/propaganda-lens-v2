import { View, Text, StyleSheet, ScrollView, Animated, KeyboardAvoidingView, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { useAnalysis } from '../hooks/use-analysis';
import { useTheme } from '../contexts/theme-context';
import { Logo } from '../components/logo';
import { InputSection } from '../components/InputSection';
import { ErrorMessage } from '../components/ErrorMessage';
import { AnalysisSkeleton } from '../components/AnalysisSkeleton';
import { AnalysisResults } from '../components/analysis-results';
import { Carousel } from '../components/Carousel';
import CounterRing from '../components/CounterRing/CounterRing';

export default function HomeScreen() {
  const [validationError, setValidationError] = useState<string>('');
  const { loading, error, result, analyze, clearError } = useAnalysis();
  const { colors, toggleTheme } = useTheme();
  const counterRef = useRef<any>(null);

  // Force clear old persistence keys on mount
  useEffect(() => {
    const clearOldPersistence = async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('free_analysis_credits');
        await AsyncStorage.removeItem('free_analysis_credits_v2');
        await AsyncStorage.removeItem('free_analysis_credits_v3');
        console.log('Cleared old counter persistence');
      } catch (error) {
        console.log('Could not clear old persistence (AsyncStorage not available)');
      }
    };
    clearOldPersistence();
  }, []);
  const insets = useSafeAreaInsets();
  const autoAnalyzeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalyzedContentRef = useRef<string>('');
  const skeletonOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const handleSubmit = async (content: string, image?: string) => {
    setValidationError('');
    
    const currentCredits = counterRef.current?.getValue() || 0;
    if (currentCredits <= 0) {
      setValidationError('You have reached your free tier limit. Upgrade to continue.');
      return;
    }
    
    if (image) {
      // Handle image analysis
      try {
        console.log('Analyzing image:', image);
        counterRef.current?.decrement();
        // TODO: Implement image analysis
        setValidationError('Image analysis coming soon!');
      } catch (err) {
        console.error('Analysis error:', err);
        setValidationError('Failed to analyze image');
      }
    } else if (content) {
      // Handle text/URL analysis
      lastAnalyzedContentRef.current = content;
      
      try {
        console.log('Analyzing content:', content);
        counterRef.current?.decrement();
        await analyze(content);
      } catch (err) {
        console.error('Analysis error:', err);
        setValidationError('Failed to analyze content');
      }
    }
  };

  // Handle loading animations
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



  return (
    <View style={[styles.homeScreenContainer, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* App Header with Logo */}
        <View style={styles.appHeader}>
          <View style={styles.logoContainer}>
            <Logo width={250} onPress={toggleTheme} />
          </View>
          <View style={{ alignItems: 'center' }}>
            <CounterRing 
              ref={counterRef}
              label="Free Analysis"
              defaultValue={10000}
              max={10000}
              persistenceKey="free_analysis_credits_v4"
              onExhausted={() => setValidationError('You have reached your free tier limit. Upgrade to continue.')}
            />
            {__DEV__ && (
              <TouchableOpacity 
                style={{ 
                  marginTop: 8, 
                  padding: 4, 
                  backgroundColor: colors.primary, 
                  borderRadius: 4 
                }}
                onPress={() => counterRef.current?.reset(10000)}
              >
                <Text style={{ color: colors.background, fontSize: 10 }}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Validation Error Banner */}
        {validationError && (
          <View style={styles.errorBanner}>
            <ErrorMessage 
              title="Input Error"
              message={validationError}
              variant="warning"
              onDismiss={() => setValidationError('')}
            />
          </View>
        )}
        
        {/* Main Content Area */}
        <ScrollView 
          style={styles.mainContentScrollView}
          contentContainerStyle={styles.mainContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Default State - Trending Carousel */}
          {!loading && !result && !error && (
            <Carousel />
          )}
          
          {/* Analysis Loading State */}
          {loading && (
            <Animated.View style={{ opacity: skeletonOpacity }}>
              <AnalysisSkeleton />
            </Animated.View>
          )}
          
          {/* Analysis Error State */}
          {error && (
            <ErrorMessage 
              message={error} 
              onDismiss={clearError}
            />
          )}
          
          {/* Analysis Results Display */}
          {result && !error && (
            <Animated.View style={{ opacity: contentOpacity }}>
              <AnalysisResults result={result} contentOpacity={contentOpacity} />
            </Animated.View>
          )}
        </ScrollView>

        {/* Bottom Input Panel */}
        <View style={[
          styles.bottomInputPanel, 
          { 
            backgroundColor: colors.background,
            paddingBottom: insets.bottom,
          }
        ]}>
          <InputSection 
            onSubmit={handleSubmit}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  homeScreenContainer: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      maxWidth: '100vw',
      overflowX: 'hidden' as any,
    }),
  },
  keyboardAvoidingWrapper: {
    flex: 1,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Platform.OS === 'web' ? 40 : 90,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  errorBanner: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  mainContentScrollView: {
    flex: 1,
  },
  mainContentContainer: {
    padding: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
  bottomInputPanel: {
    paddingTop: 16,
  },
});