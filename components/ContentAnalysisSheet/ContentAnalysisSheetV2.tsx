import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../constants/fonts';
import { Button } from '../Button';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Color variables
const colors = {
  default: 'rgba(0, 0, 0, 0.8)',
};


interface ContentAnalysisSheetV2Props {
  content: string;
  analysis: any;
  isLoading?: boolean;
  isVisible: boolean;
  onClose: () => void;
}

export function ContentAnalysisSheetV2({ 
  content, 
  analysis, 
  isLoading = false,
  isVisible,
  onClose
}: ContentAnalysisSheetV2Props) {
  // Bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const scrollViewRef = useRef<any>(null);
  
  // Narrative flip state
  const [isNarrativeFlipped, setIsNarrativeFlipped] = useState(false);
  const flipAnimation = useSharedValue(0);
  
  // Scroll animation values
  const scrollY = useSharedValue(0);
  const headerHeight = 250; // Height of full header
  const compactHeaderHeight = 60; // Height of compact header

  // Bottom sheet snap points - 80% and 95% for scrolling
  const snapPoints = useMemo(() => ['80%', '95%'], []);
  
  // Animated backdrop component
  const renderBackdrop = useCallback(
    (props: any) => {
      const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
          props.animatedIndex.value,
          [-1, 0],
          [0, 1],
          Extrapolate.CLAMP
        ),
      }));

      const animatedProps = useAnimatedProps(() => ({
        intensity: interpolate(
          props.animatedIndex.value,
          [-1, 0],
          [0, 25],
          Extrapolate.CLAMP
        ),
      }));

      return (
        <Animated.View 
          style={[StyleSheet.absoluteFillObject, containerAnimatedStyle]}
        >
          <AnimatedBlurView
            style={StyleSheet.absoluteFillObject}
            animatedProps={animatedProps}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
          />
          <Animated.View 
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: 'rgba(0, 0, 0, 0.3)' },
              containerAnimatedStyle
            ]}
          />
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => bottomSheetRef.current?.close()}
          />
        </Animated.View>
      );
    },
    []
  );

  // Handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);


  // Handle scroll event
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  }, [scrollY]);
  
  // Handle scroll to top
  const handleScrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    scrollY.value = withTiming(0, { duration: 300 });
  }, []);
  
  // Handle share
  const handleShare = useCallback(async () => {
    try {
      const result = await Share.share({
        message: `Check out this propaganda analysis: ${analysis?.summary || 'Content analyzed for propaganda techniques'} - Shared via Propaganda Lens`,
        title: 'Propaganda Analysis',
      });
      console.log('Share result:', result);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [analysis]);

  // Handle narrative flip
  const handleFlipNarrative = useCallback(() => {
    flipAnimation.value = withTiming(isNarrativeFlipped ? 0 : 1, { duration: 600 });
    setTimeout(() => {
      setIsNarrativeFlipped(!isNarrativeFlipped);
    }, 300);
  }, [isNarrativeFlipped, flipAnimation]);

  const renderBackground = useCallback(
    (props: any) => (
      <LinearGradient
        {...props}
        colors={['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.2)']}
        style={[props.style, styles.bottomSheetBackground]}
      />
    ),
    []
  );

  // Animated style for card flip effect
  const frontCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(flipAnimation.value, [0, 0.5, 1], [1, 0.95, 1]);
    const opacity = interpolate(flipAnimation.value, [0, 0.3, 0.7, 1], [1, 0.3, 0.3, 1]);
    return {
      transform: [{ scaleX: scale }],
      opacity,
    };
  });

  // Animated styles for header transformation
  const SCROLL_DISTANCE = 120; // Distance for full transformation
  
  // Main header container animation
  const headerContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [0, -180],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateY }],
    };
  });
  
  // Icon animation - shrink and move up
  const iconStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [1, 0],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE * 0.5],
      [1, 0],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });
  
  // Title animation - move up and shrink
  const titleStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [0, -80],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [1, 0.7],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateY }, { scale }],
    };
  });
  
  // Description fade out
  const descriptionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE * 0.5],
      [1, 0],
      Extrapolate.CLAMP
    );
    
    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [0, -20],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });
  
  // Compact header fade in
  const compactHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_DISTANCE * 0.7, SCROLL_DISTANCE],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    const translateY = interpolate(
      scrollY.value,
      [SCROLL_DISTANCE * 0.5, SCROLL_DISTANCE],
      [20, 0],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });
  
  // Buttons animation
  const buttonsStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_DISTANCE * 0.6, SCROLL_DISTANCE],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      scrollY.value,
      [SCROLL_DISTANCE * 0.6, SCROLL_DISTANCE],
      [0.8, 1],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      transform: [{ scale }],
    };
  });
  
  

  if (!isVisible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="auto">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        enableDynamicSizing={false}
        backgroundComponent={renderBackground}
        handleIndicatorStyle={styles.handleIndicator}
        backdropComponent={renderBackdrop}
        animateOnMount={true}
        activeOffsetY={[-5, 5]}
        failOffsetX={[-10, 10]}
        enableContentPanningGesture={true}
        enableHandlePanningGesture={true}
      >
      {/* Fixed Compact Header - appears on scroll */}
      <Animated.View style={[styles.fixedCompactHeader, compactHeaderStyle]} pointerEvents="auto">
        <Animated.View style={[styles.compactHeaderContent, buttonsStyle]}>
          <TouchableOpacity 
            style={styles.compactHeaderButton}
            onPress={handleScrollToTop}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.compactHeaderTitle}>
            {content.includes('COVID') || content.includes('covid') 
              ? 'COVID-19 Propaganda'
              : 'Analysis Results'
            }
          </Text>
          <TouchableOpacity 
            style={styles.compactHeaderButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={22} color="#000000" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
      
      <BottomSheetScrollView 
        ref={scrollViewRef}
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
          {isLoading ? (
            <Text style={styles.loadingText}>Analyzing content...</Text>
          ) : (
            <>
              {/* Full Header Content that scrolls */}
              <Animated.View style={[styles.scrollableHeader, headerContainerStyle]}>
                <Animated.Image 
                  source={
                    content.includes('COVID') || content.includes('covid') 
                      ? require('../../assets/analysis-icons/covid-19.png')
                      : require('../../assets/analysis-icons/unknown.png')
                  } 
                  style={[styles.headingIcon, iconStyle]}
                />
                <Animated.Text style={[styles.headingTitle, titleStyle]}>
                  {content.includes('COVID') || content.includes('covid') 
                    ? 'COVID-19 Propaganda'
                    : 'Analysis Results'
                  }
                </Animated.Text>
                <Animated.Text style={[styles.headingDescription, descriptionStyle]}>
                  {content.includes('COVID') || content.includes('covid') 
                    ? 'Identifying misinformation and propaganda techniques\nin COVID-19 related content'
                    : 'Detailed propaganda analysis of the content'
                  }
                </Animated.Text>
              </Animated.View>

            {/* Confidence Level Card */}
            <View style={styles.insideCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Confidence level</Text>
                <View style={styles.confidenceIndicator}>
                  {(() => {
                    const confidence = analysis?.confidence || 0.5; // Default to fair
                    if (confidence >= 0.8) {
                      return (
                        <>
                          <Text style={[styles.confidenceLabel, { color: '#4caf50' }]}>High</Text>
                          <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
                        </>
                      );
                    } else if (confidence >= 0.5) {
                      return (
                        <>
                          <Text style={[styles.confidenceLabel, { color: '#ff9800' }]}>Fair</Text>
                          <Ionicons name="help-circle" size={24} color="#ff9800" />
                        </>
                      );
                    } else {
                      return (
                        <>
                          <Text style={[styles.confidenceLabel, { color: '#f44336' }]}>Low</Text>
                          <Ionicons name="warning" size={24} color="#f44336" />
                        </>
                      );
                    }
                  })()}
                </View>
              </View>
            </View>

            {/* Narrative Detected Card */}
            <Animated.View style={[styles.insideCard, frontCardStyle]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {isNarrativeFlipped ? 'Counter narrative' : 'Narrative detected'}
                </Text>
              </View>
              <Text style={styles.narrativeDescription}>
                {isNarrativeFlipped 
                  ? '"Questions remain about vaccine long-term effects and natural immunity. Critical thinking and personal choice should guide health decisions, not mandates from authorities."'
                  : '"COVID-19 vaccines are safe and effective. Trust the science and follow public health guidelines to protect yourself and others from this dangerous virus."'
                }
              </Text>
              <Button
                title={isNarrativeFlipped ? 'Show original narrative' : 'Flip the narrative'}
                icon="refresh-outline"
                iconPosition="left"
                onPress={handleFlipNarrative}
                variant="secondary"
                size="medium"
                style={styles.flipButton}
                textStyle={styles.flipButtonText}
              />
            </Animated.View>

            {/* What We Detected Card */}
            <View style={styles.insideCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>What we detected</Text>
              </View>
              
              {/* Biases and Sub-narratives List */}
              <View style={styles.detectionsList}>
                {/* COVID-19 Misinformation */}
                <TouchableOpacity style={styles.detectionItem} activeOpacity={0.7}>
                  <Image 
                    source={require('../../assets/analysis-icons/covid-19.png')} 
                    style={styles.detectionIcon}
                  />
                  <View style={styles.detectionContent}>
                    <Text style={styles.detectionTitle}>COVID-19 Misinformation</Text>
                    <Text style={styles.detectionDescription}>
                      Vaccine skepticism and anti-mandate rhetoric
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(0, 0, 0, 0.3)" />
                </TouchableOpacity>
                <View style={styles.detectionDivider} />

                {/* Authority Bias */}
                <TouchableOpacity style={styles.detectionItem} activeOpacity={0.7}>
                  <Image 
                    source={require('../../assets/analysis-icons/authority.png')} 
                    style={styles.detectionIcon}
                  />
                  <View style={styles.detectionContent}>
                    <Text style={styles.detectionTitle}>Appeal to Authority</Text>
                    <Text style={styles.detectionDescription}>
                      Using "trust the science" without evidence
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(0, 0, 0, 0.3)" />
                </TouchableOpacity>
                <View style={styles.detectionDivider} />

                {/* Fear Mongering */}
                <TouchableOpacity style={styles.detectionItem} activeOpacity={0.7}>
                  <Image 
                    source={require('../../assets/analysis-icons/fear.png')} 
                    style={styles.detectionIcon}
                  />
                  <View style={styles.detectionContent}>
                    <Text style={styles.detectionTitle}>Fear Mongering</Text>
                    <Text style={styles.detectionDescription}>
                      Exaggerating dangers to influence behavior
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(0, 0, 0, 0.3)" />
                </TouchableOpacity>
                <View style={styles.detectionDivider} />

                {/* Government Narrative */}
                <TouchableOpacity style={styles.detectionItem} activeOpacity={0.7}>
                  <Image 
                    source={require('../../assets/analysis-icons/government.png')} 
                    style={styles.detectionIcon}
                  />
                  <View style={styles.detectionContent}>
                    <Text style={styles.detectionTitle}>Government Narrative</Text>
                    <Text style={styles.detectionDescription}>
                      Promoting official health policy positions
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(0, 0, 0, 0.3)" />
                </TouchableOpacity>
                <View style={styles.detectionDivider} />

                {/* Pharma Influence */}
                <TouchableOpacity style={styles.detectionItem} activeOpacity={0.7}>
                  <Image 
                    source={require('../../assets/analysis-icons/pharma.png')} 
                    style={styles.detectionIcon}
                  />
                  <View style={styles.detectionContent}>
                    <Text style={styles.detectionTitle}>Pharmaceutical Influence</Text>
                    <Text style={styles.detectionDescription}>
                      Potential industry-backed messaging
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(0, 0, 0, 0.3)" />
                </TouchableOpacity>
                <View style={styles.detectionDivider} />

                {/* Inflammatory Language */}
                <TouchableOpacity style={styles.detectionItem} activeOpacity={0.7}>
                  <Image 
                    source={require('../../assets/analysis-icons/inflamatory.png')} 
                    style={styles.detectionIcon}
                  />
                  <View style={styles.detectionContent}>
                    <Text style={styles.detectionTitle}>Inflammatory Language</Text>
                    <Text style={styles.detectionDescription}>
                      Using divisive terms to polarize opinion
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(0, 0, 0, 0.3)" />
                </TouchableOpacity>
                <View style={styles.detectionDivider} />

                {/* Framing Bias */}
                <TouchableOpacity style={styles.detectionItem} activeOpacity={0.7}>
                  <Image 
                    source={require('../../assets/analysis-icons/framing.png')} 
                    style={styles.detectionIcon}
                  />
                  <View style={styles.detectionContent}>
                    <Text style={styles.detectionTitle}>Selective Framing</Text>
                    <Text style={styles.detectionDescription}>
                      Presenting only one side of the debate
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(0, 0, 0, 0.3)" />
                </TouchableOpacity>
                <View style={styles.detectionDivider} />

                {/* Anti-Free Speech */}
                <TouchableOpacity style={styles.detectionItem} activeOpacity={0.7}>
                  <Image 
                    source={require('../../assets/analysis-icons/anti-free-speech.png')} 
                    style={styles.detectionIcon}
                  />
                  <View style={styles.detectionContent}>
                    <Text style={styles.detectionTitle}>Censorship Narrative</Text>
                    <Text style={styles.detectionDescription}>
                      Claims about suppression of dissent
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(0, 0, 0, 0.3)" />
                </TouchableOpacity>
              </View>
            </View>
            </>
          )}
      </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  handleIndicator: {
    backgroundColor: '#d0d0d0',
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 40,
  },
  headingIcon: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  headingTitle: {
    fontSize: 32,
    fontFamily: fonts.serifRegular,
    color: colors.default,
    textAlign: 'center',
    marginBottom: 8,
  },
  headingDescription: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  insideCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    marginTop: 24,
    padding: 30,
    width: '100%',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.default,
  },
  confidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  narrativeDescription: {
    fontSize: 28,
    fontFamily: fonts.serifRegular,
    color: colors.default,
    lineHeight: 36,
    marginTop: 16,
    marginBottom: 20,
  },
  flipButton: {
    alignSelf: 'flex-start',
  },
  flipButtonText: {
    fontSize: 14,
  },
  flipContainer: {
    position: 'relative',
    marginTop: 24,
    width: '100%',
    height: 200, // Fixed height to contain absolutely positioned cards
  },
  flipCard: {
    position: 'absolute',
    width: '100%',
    marginTop: 0,
  },
  flipCardBack: {
    position: 'absolute',
    top: 0,
  },
  // Header styles
  scrollableHeader: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  fixedCompactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 100,
    elevation: 100,
  },
  compactHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  compactHeaderTitle: {
    fontSize: 22,
    fontFamily: fonts.serifRegular,
    color: colors.default,
    flex: 1,
    textAlign: 'center',
  },
  compactHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Detection items styles
  detectionsList: {
    marginTop: 16,
    gap: 16,
  },
  detectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  detectionIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  detectionContent: {
    flex: 1,
  },
  detectionTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.default,
    marginBottom: 4,
  },
  detectionDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 20,
  },
  detectionDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 8,
  },
});