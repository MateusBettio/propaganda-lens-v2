import { View, Text, StyleSheet, ScrollView, Animated, KeyboardAvoidingView, Platform, TouchableOpacity, Dimensions, Keyboard, KeyboardEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect, useCallback } from 'react';
import { BlurView } from 'expo-blur';
import { useAnalysis } from '../hooks/use-analysis';
import { useTheme } from '../contexts/theme-context';
import { Logo } from '../components/logo';
import { InputSection } from '../components/InputSection';
import { ErrorMessage } from '../components/ErrorMessage';
import { AnalysisSkeleton } from '../components/AnalysisSkeleton';
import { AnalysisResults } from '../components/analysis-results';
import { Carousel } from '../components/Carousel';
import CounterRing from '../components/CounterRing/CounterRing';
import { ContentAnalysisSheetV2 } from '../components/ContentAnalysisSheet/ContentAnalysisSheetV2';

export default function HomeScreen() {
  const [validationError, setValidationError] = useState<string>('');
  const { loading, error, result, analyze, clearError } = useAnalysis();
  const { colors, toggleTheme } = useTheme();
  const counterRef = useRef<any>(null);
  // ContentAnalysisSheetV2 state management
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetContent, setSheetContent] = useState<string>('');
  const [sheetAnalysis, setSheetAnalysis] = useState<any>(null);
  const [sheetLoading, setSheetLoading] = useState(false);

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
  
  // Keyboard height tracking for absolute positioning
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardWillShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
    };

    const keyboardWillHide = () => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      keyboardWillShow
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      keyboardWillHide
    );

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

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

  // Remove custom keyboard handling - let KeyboardAvoidingView handle everything
  // This prevents conflicts and ensures proper Android behavior


  // Handle carousel item click
  const handleCarouselItemClick = useCallback((item: any) => {
    console.log('Carousel item clicked:', item.title);
    // Set content and open sheet with empty analysis
    setSheetContent(item.description);
    setSheetAnalysis(null);
    setSheetVisible(true);
    console.log('Sheet should be visible now:', true);
  }, []);

  return (
    <View style={[styles.homeScreenContainer, { backgroundColor: colors.background }]}>
      {/* App Header with Logo */}
      <View style={styles.appHeader}>
        <View style={styles.logoContainer}>
          <Logo width={185} onPress={toggleTheme} />
        </View>
        <View style={styles.counterContainer}>
          <CounterRing 
            ref={counterRef}
            label="Free Analysis"
            defaultValue={10000}
            max={10000}
            persistenceKey="free_analysis_credits_v4"
            onExhausted={() => setValidationError('You have reached your free tier limit. Upgrade to continue.')}
          />
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
      
      {/* Main Content Area - Manual keyboard handling */}
      <ScrollView 
        style={styles.mainContentScrollView}
        contentContainerStyle={[
          styles.mainContentContainer,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 100 : 80 }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Default State - Trending Carousel */}
        {!loading && !result && !error && (
          <Carousel onItemPress={handleCarouselItemClick} />
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
            <AnalysisResults 
              result={result} 
              contentOpacity={contentOpacity}
              onTechniquePress={(technique, fullResult) => {
                console.log('Opening modal with analysis data:', {
                  techniques: fullResult.techniques?.length,
                  quickAssessment: fullResult.quickAssessment?.substring(0, 50),
                  counterPerspective: fullResult.counterPerspective?.substring(0, 50),
                  reflectionQuestions: fullResult.reflectionQuestions?.length
                });
                
                // Open the modal with full analysis data
                setSheetContent(lastAnalyzedContentRef.current);
                setSheetAnalysis({
                  confidence: fullResult.confidence || fullResult.manipulationScore,
                  summary: fullResult.quickAssessment || 'Detailed analysis of detected propaganda techniques',
                  techniques: fullResult.techniques?.map((t: any) => ({
                    name: t.name,
                    description: t.description,
                    severity: t.confidence === 'high' ? 'high' : t.confidence === 'medium' ? 'medium' : 'low',
                    examples: t.example ? [t.example] : []
                  }))
                });
                setSheetVisible(true);
              }}
            />
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Input Panel - Absolute positioning above keyboard */}
      <View 
        style={[
          styles.bottomInputPanel, 
          { 
            backgroundColor: colors.background,
            position: 'absolute',
            bottom: keyboardHeight > 0 ? keyboardHeight : 0,
            left: 0,
            right: 0,
            paddingBottom: keyboardHeight > 0 ? 16 : 0,
          }
        ]}
      >
        <InputSection 
          onSubmit={handleSubmit}
          loading={loading}
          disabled={sheetVisible}
        />
      </View>
      
      {/* Analysis Sheet V2 */}
      {sheetVisible && (
        <ContentAnalysisSheetV2 
          content={sheetContent}
          analysis={sheetAnalysis}
          isLoading={sheetLoading}
          isVisible={sheetVisible}
          onClose={() => setSheetVisible(false)}
        />
      )}
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
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Changed from flex-start to center for horizontal alignment
    paddingTop: Platform.OS === 'web' ? 40 : 90,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  counterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
});