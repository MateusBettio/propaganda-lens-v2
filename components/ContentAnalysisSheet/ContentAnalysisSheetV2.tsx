import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Dimensions,
  // Removed scroll event imports - no longer needed
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../constants/fonts';
import { SharedContent } from './SharedContent';
import { PoliticalPerspectiveCarousel, PoliticalPerspective } from './PoliticalPerspectiveCarousel';
import { ChatInputLight } from '../Chat/ChatInputLight';
import { ChatScreen } from '../Chat';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Extrapolate,
} from 'react-native-reanimated';
// Removed gesture detector import - no longer needed for swipe gestures

// Extracted imports
import { ContentAnalysisSheetV2Props } from './types';
import { THEME_COLORS, ANIMATION_CONFIG, LAYOUT_CONFIG } from './constants';
import { useTabGestures, TabType } from './useTabGestures';
import {
  detectContentType,
  getDetectionItems,
  categorizeDetectionItems,
  getContentDisplayInfo,
  DetectionItem
} from './contentDetection';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function ContentAnalysisSheetV2(props: ContentAnalysisSheetV2Props) {
  const {
    content,
    analysis,
    isLoading = false,
    isVisible,
    onClose,
    sharedContent,
    sharedContentType,
    sources,
    isTrendingAnalysis = false
  } = props;

  // Refs
  const bottomSheetRef = useRef<BottomSheet>(null);
  const scrollViewRef = useRef<any>(null);

  // Local state
  const [selectedPerspective, setSelectedPerspective] = useState<PoliticalPerspective | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  const [initialChatMessage, setInitialChatMessage] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [chatKey, setChatKey] = useState(0);

  // Animation values - only keep flip animation for perspective carousel
  const flipAnimation = useSharedValue(0);
  // Removed scrollY - no longer needed for header animations

  // Custom hooks - simplified without gesture handling
  const {
    tabTransition,
    handleTabChange,
    resetTabAnimation,
  } = useTabGestures({ onTabChange: setActiveTab });

  // Constants
  const snapPoints = useMemo(() => [...LAYOUT_CONFIG.BOTTOM_SHEET_SNAP_POINTS], []);

  // Content detection
  const contentType = useMemo(() => detectContentType(content), [content]);
  const detectionItems = useMemo(() => getDetectionItems(contentType), [contentType]);
  const categorizedData = useMemo(() => categorizeDetectionItems(detectionItems), [detectionItems]);
  const displayInfo = useMemo(() => getContentDisplayInfo(contentType), [contentType]);
  
  // Handle modal visibility changes
  useEffect(() => {
    if (isVisible && bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(0);
    } else if (!isVisible && bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }
  }, [isVisible]);


  // Chat handlers
  const handleChatSubmit = useCallback((message: string) => {
    console.log('Chat message submitted:', message);
    setChatMessages(prev => [...prev, message]);
    setInitialChatMessage(message);
    // Force re-mount of ChatScreen with new message
    setChatKey(prev => prev + 1);
    // Switch to chat tab after setting up the message
    setTimeout(() => {
      handleTabChange('chat');
    }, 100);
  }, [handleTabChange]);

  // This is now handled by the useTabGestures hook

  // Gesture handlers are now provided by useTabGestures hook

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

      const handleBackdropPress = () => {
        bottomSheetRef.current?.close();
      };

      return (
        <Animated.View 
          style={[StyleSheet.absoluteFillObject, containerAnimatedStyle]}
          pointerEvents={props.animatedIndex.value > -1 ? 'auto' : 'none'}
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
            onPress={handleBackdropPress}
          />
        </Animated.View>
      );
    },
    []
  );

  // Handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // Reset state when closing
      setSelectedPerspective(null);
      setExpandedItems(new Set());
      flipAnimation.value = 0;
      resetTabAnimation();
      setActiveTab('analysis');
      setChatMessages([]);
      setInitialChatMessage('');
      setChatKey(0);
      onClose();
    }
  }, [onClose, flipAnimation, resetTabAnimation]);


  // Removed scroll handlers - no longer needed for header animations
  
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
  
  // Handle accordion toggle
  const toggleAccordionItem = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Handle perspective change
  const handlePerspectiveChange = useCallback((perspective: PoliticalPerspective) => {
    flipAnimation.value = withTiming(1, { duration: 300 }, () => {
      flipAnimation.value = withTiming(0, { duration: 300 });
    });
    setSelectedPerspective(perspective);
  }, [flipAnimation]);

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

  // Removed all header scroll animations - no longer needed

  // Tab transition animated styles
  const analysisTabStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      tabTransition.value,
      [0, 1],
      [0, -100], // Slide out to the left when switching to chat
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      tabTransition.value,
      [0, 0.3, 1],
      [1, 0.3, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  const chatTabStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      tabTransition.value,
      [0, 1],
      [100, 0], // Slide in from the right when switching to chat
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      tabTransition.value,
      [0, 0.7, 1],
      [0, 0.3, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  // Function now replaced by extracted utilities in contentDetection.ts

  // Simple Accordion Item Component (no VirtualizedList)
  const SimpleAccordionItem = ({ 
    item, 
    isExpanded, 
    onToggle 
  }: { 
    item: any; 
    isExpanded: boolean; 
    onToggle: () => void; 
  }) => (
    <>
      <TouchableOpacity 
        style={styles.detectionItem} 
        activeOpacity={0.7}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}. ${isExpanded ? 'Expanded' : 'Collapsed'}. Tap to ${isExpanded ? 'collapse' : 'expand'}.`}
        accessibilityState={{ expanded: isExpanded }}
      >
        <Image 
          source={item.icon} 
          style={styles.detectionIcon}
        />
        <View style={styles.detectionContent}>
          <Text style={styles.detectionTitle}>{item.title}</Text>
          <Text style={styles.detectionDescription}>
            {item.description}
          </Text>
        </View>
        <Ionicons 
          name={isExpanded ? "chevron-down" : "chevron-forward"} 
          size={20} 
          color="rgba(0, 0, 0, 0.3)" 
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.accordionExpanded}>
          <Text style={styles.accordionExpandedText}>
            {item.detailedContent}
          </Text>
        </View>
      )}
      
      <View style={styles.detectionDivider} />
    </>
  );

  if (!isVisible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
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
      {/* Removed visible tab navigation - switching happens via chat interactions */}

      {/* Content Container with Tab Animation */}
      <View style={{ flex: 1, position: 'relative' }}>
        {/* Analysis Tab Content - Removed swipe gestures */}
        <Animated.View style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: activeTab === 'analysis' ? 1 : 0
          },
          analysisTabStyle
        ]}>
          <BottomSheetScrollView
            ref={scrollViewRef}
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: LAYOUT_CONFIG.ANALYSIS_CONTENT_BOTTOM_PADDING }]}
            bounces={true}
            alwaysBounceVertical={true}
            // Removed scroll handler - no longer needed for animations
            // onScroll={handleScroll}
            // scrollEventThrottle={16}
          >
          {isLoading ? (
            <Text style={styles.loadingText}>Analyzing content...</Text>
          ) : (
            <>
              {/* Simplified Header Content - No animations */}
              <View style={styles.scrollableHeader}>
                <Image
                  source={displayInfo.icon}
                  style={styles.headingIcon}
                />
                <Text style={styles.headingTitle}>
                  {displayInfo.title}
                </Text>
                <Text style={styles.headingDescription}>
                  {displayInfo.description}
                </Text>
              </View>

            {/* Shared Content Section */}
            <SharedContent
              content={sharedContent}
              contentType={isTrendingAnalysis ? 'trending' : sharedContentType}
              sources={sources}
              analyzeMetadata={true}
            />

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
                  {selectedPerspective ? `${selectedPerspective.charAt(0).toUpperCase() + selectedPerspective.slice(1)} perspective` : 'Narrative detected'}
                </Text>
              </View>
              <Text style={styles.narrativeDescription}>
                {(() => {
                  const getNarrative = (perspective: PoliticalPerspective | null) => {
                    if (content.includes('who.int') || content.includes('COVID') || content.includes('covid')) {
                      switch(perspective) {
                        case 'left':
                          return '"The government must enforce strict health measures to protect vulnerable populations. Anti-vaxxers are endangering society with their selfish behavior."';
                        case 'center':
                          return '"Vaccines have benefits and risks that should be openly discussed. Public health measures should balance safety with personal freedoms."';
                        case 'right':
                          return '"Personal medical freedom is paramount. Government mandates are unconstitutional overreach that violates individual liberty."';
                        case 'libertarian':
                          return '"Each person owns their body and should make their own medical decisions. The state has no authority to mandate medical procedures."';
                        case 'authoritarian':
                          return '"Strong government action is needed to combat this crisis. Those who refuse compliance must face consequences for the greater good."';
                        default:
                          return '"COVID-19 vaccines are safe and effective. Trust the science and follow public health guidelines to protect yourself and others from this dangerous virus."';
                      }
                    } else if (content.includes('bbc.com') || content.includes('Hamas-Israel War')) {
                      switch(perspective) {
                        case 'left':
                          return '"Israel is an apartheid state committing genocide. Palestinian resistance is justified against colonial oppression."';
                        case 'center':
                          return '"Both sides have legitimate grievances and have committed wrongs. A two-state solution requires compromise from both parties."';
                        case 'right':
                          return '"Israel has the right to defend itself against terrorism. Hamas is using civilians as human shields."';
                        case 'libertarian':
                          return '"Foreign interventions and aid perpetuate this conflict. Let both sides resolve their disputes without external interference."';
                        case 'authoritarian':
                          return '"Strong military action is justified to establish order. One side must achieve decisive victory to end the chaos."';
                        default:
                          return '"Israel is committing genocide against Palestinians. The international community must act to stop this ethnic cleansing and hold war criminals accountable."';
                      }
                    } else if (content.includes('apnews.com') || content.includes('Anti-Gun Propaganda')) {
                      switch(perspective) {
                        case 'left':
                          return '"Assault weapons have no place in civilian hands. We need comprehensive gun control to stop the epidemic of gun violence."';
                        case 'center':
                          return '"Common-sense gun regulations can respect the Second Amendment while improving public safety through background checks and red flag laws."';
                        case 'right':
                          return '"The Second Amendment is absolute. Gun control only disarms law-abiding citizens while criminals ignore the laws."';
                        case 'libertarian':
                          return '"Gun ownership is a fundamental right. The government has no constitutional authority to restrict arms."';
                        case 'authoritarian':
                          return '"Only government and law enforcement should have weapons. Civilian disarmament is necessary for public order."';
                        default:
                          return '"We must implement immediate gun control measures. No civilian needs assault weapons - common sense gun laws will save lives and prevent future tragedies."';
                      }
                    } else {
                      switch(perspective) {
                        case 'left':
                          return '"Progressive values and social justice should guide our interpretation of this content."';
                        case 'center':
                          return '"A balanced, moderate approach considering multiple viewpoints is most appropriate here."';
                        case 'right':
                          return '"Traditional values and conservative principles provide the best framework for understanding this issue."';
                        case 'libertarian':
                          return '"Individual freedom and minimal government intervention are the key principles to consider."';
                        case 'authoritarian':
                          return '"Strong leadership and collective order are necessary to address this situation effectively."';
                        default:
                          return '"Primary narrative detected in the analyzed content."';
                      }
                    }
                  };
                  return getNarrative(selectedPerspective);
                })()}
              </Text>
              <PoliticalPerspectiveCarousel
                selectedPerspective={selectedPerspective}
                onPerspectiveSelect={handlePerspectiveChange}
              />
            </Animated.View>

            {/* What We Detected Card */}
            <View style={styles.insideCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>What we detected</Text>
              </View>
              
              {/* Categorized Accordion Items */}
              <View style={styles.detectionsList}>
                {Object.entries(categorizedData).map(([categoryKey, category]) => {
                    if (category.items.length === 0) return null;
                    
                    return (
                      <View key={categoryKey} style={styles.categorySection}>
                        <View style={styles.categoryHeader}>
                          <Ionicons name={category.icon as any} size={20} color="rgba(0, 0, 0, 0.6)" />
                          <Text style={styles.categoryTitle}>{category.label}</Text>
                          <View style={styles.countBadge}>
                            <Text style={styles.countText}>{category.items.length}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.categoryItems}>
                          {category.items.map((item) => (
                            <SimpleAccordionItem
                              key={item.id}
                              item={item}
                              isExpanded={expandedItems.has(item.id)}
                              onToggle={() => toggleAccordionItem(item.id)}
                            />
                          ))}
                        </View>
                      </View>
                    );
                  })}
              </View>
            </View>
            </>
          )}
          </BottomSheetScrollView>
        </Animated.View>

        {/* Chat Tab Content - Removed swipe gestures */}
        <Animated.View style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: activeTab === 'chat' ? 1 : 0,
            flex: 1
          },
          chatTabStyle
        ]}>
          {/* Chat Header with Back Button */}
          <View style={styles.chatHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => handleTabChange('analysis')}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="rgba(0, 0, 0, 0.8)" />
            </TouchableOpacity>
            <Text style={styles.chatTitle}>Ask Questions</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.chatContentWrapper}>
              <ChatScreen
                key={`chat-${chatKey}`}
                aiApiKey={process.env.EXPO_PUBLIC_OPENAI_API_KEY}
                aiModel="gpt-3.5-turbo"
                enableImages={true}
                initialUserMessage={initialChatMessage ? initialChatMessage : undefined}
                context={{
                  url: content,
                  sharedContent: sharedContent,
                  analysis: analysis,
                  contentType: sharedContentType,
                }}
                onSendMessage={(message) => {
                  console.log('Analysis chat message sent:', message);
                  setChatMessages(prev => [...prev, message]);
                }}
              />
          </View>
        </Animated.View>
      </View>

      {/* Chat Input - Always visible in analysis tab */}
      {activeTab === 'analysis' && (
        <View style={styles.fixedChatInputContainer}>
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
            style={styles.chatInputGradient}
          >
            <ChatInputLight
              onSubmit={handleChatSubmit}
              placeholder="Ask about this content..."
            />
          </LinearGradient>
        </View>
      )}
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
    marginTop: 0, // Removed top margin since no tab switcher
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
    color: THEME_COLORS.default,
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    marginTop: 24,
    padding: 30,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: THEME_COLORS.default,
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
    color: THEME_COLORS.default,
    lineHeight: 36,
    marginTop: 16,
    marginBottom: 20,
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
  // Header styles - simplified
  scrollableHeader: {
    alignItems: 'center',
    paddingBottom: 20,
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
    color: THEME_COLORS.default,
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
  accordionExpanded: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  accordionExpandedText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: 'rgba(0, 0, 0, 0.8)',
    lineHeight: 22,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: 'rgba(0, 0, 0, 0.7)',
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  categoryItems: {
    paddingLeft: 28,
  },
  // Chat styles
  fixedChatInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  chatInputGradient: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 80,
  },
  chatBottomSheetBackground: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  chatHandleIndicator: {
    backgroundColor: '#d0d0d0',
    width: 40,
    height: 4,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'transparent',
  },
  chatTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: THEME_COLORS.default,
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerSpacer: {
    width: 48, // Same width as back button for centering
  },
  chatContent: {
    flex: 1,
    marginTop: 60,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  chatContentWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  chatPlaceholder: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Removed tab switcher styles - no longer needed
  chatInnerContainer: {
    flex: 1,
    paddingBottom: 200, // Space for input at bottom
  },
  chatMessagesArea: {
    flex: 1,
  },
  chatInputInChatTab: {
    bottom: 0,
    backgroundColor: 'transparent',
  },
});