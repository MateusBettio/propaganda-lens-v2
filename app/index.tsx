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
    console.log('Carousel item clicked:', item.title, 'URL:', item.url);
    console.log('Full item:', item);
    
    // Create specific analysis data for each carousel item
    const getAnalysisForItem = (itemId: string) => {
      switch (itemId) {
        case '1': // COVID-19 Misinformation
          return {
            confidence: 87,
            summary: 'Analysis detected multiple propaganda techniques commonly used in COVID-19 misinformation campaigns, including fear appeals, false authority claims, and cherry-picked data to undermine public health measures.',
            techniques: [
              {
                name: 'Fear Appeals',
                description: 'Using fear-inducing language to discourage vaccination or compliance with health measures',
                severity: 'high',
                examples: ['Vaccine side effects are being covered up by big pharma']
              },
              {
                name: 'False Authority',
                description: 'Citing discredited or unqualified sources as medical experts',
                severity: 'high',
                examples: ['Dr. X says vaccines are dangerous (but Dr. X is not an immunologist)']
              },
              {
                name: 'Cherry-Picking',
                description: 'Selecting only data that supports a predetermined conclusion while ignoring contrary evidence',
                severity: 'medium',
                examples: ['Focusing only on rare adverse events while ignoring overall safety data']
              }
            ]
          };
        case '2': // Hamas-Israel War
          return {
            confidence: 92,
            summary: 'Analysis identified propaganda techniques including emotional manipulation, selective framing, and dehumanization tactics commonly used by all sides to shape public opinion about the Israel-Palestine conflict.',
            techniques: [
              {
                name: 'Emotional Manipulation',
                description: 'Using emotionally charged imagery and language to bypass rational analysis',
                severity: 'high',
                examples: ['Graphic images without context to generate outrage']
              },
              {
                name: 'Selective Framing',
                description: 'Presenting events in a way that supports one narrative while omitting crucial context',
                severity: 'high',
                examples: ['Showing only the response to an attack, not the initial provocation']
              },
              {
                name: 'Dehumanization',
                description: 'Portraying the opposing side as less than human to justify violence',
                severity: 'high',
                examples: ['Referring to enemies as "animals" or "terrorists" without distinction']
              }
            ]
          };
        case '3': // Anti-Gun Propaganda
          return {
            confidence: 78,
            summary: 'Analysis detected propaganda techniques including loaded language, false dilemmas, and statistical manipulation commonly used in gun control debates to influence public opinion.',
            techniques: [
              {
                name: 'Loaded Language',
                description: 'Using emotionally charged terms to bias the audience',
                severity: 'medium',
                examples: ['"Assault weapons" vs "modern sporting rifles" - different terms for same items']
              },
              {
                name: 'False Dilemma',
                description: 'Presenting only two extreme options when many solutions exist',
                severity: 'high',
                examples: ['Either ban all guns or accept mass shootings as normal']
              },
              {
                name: 'Statistical Manipulation',
                description: 'Using misleading statistics or presenting data without proper context',
                severity: 'medium',
                examples: ['Including suicides in "gun violence" statistics to inflate numbers']
              }
            ]
          };
        default:
          return null;
      }
    };
    
    // Set URL as content and specific analysis data
    setSheetContent(item.url);
    setSheetAnalysis(getAnalysisForItem(item.id));
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
          sharedContent={sheetContent}
          sharedContentType="url"
          sources={[
            {
              title: 'Breaking News: Major Development',
              url: 'https://news1.com/story',
              domain: 'news1.com',
              thumbnail: 'https://picsum.photos/120/60?1'
            },
            {
              title: 'Expert Analysis on Latest Events',
              url: 'https://analysis.com/expert-view',
              domain: 'analysis.com',
              thumbnail: 'https://picsum.photos/120/60?2'
            }
          ]}
          isTrendingAnalysis={false}
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