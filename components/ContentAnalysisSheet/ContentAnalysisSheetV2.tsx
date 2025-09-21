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
import { SharedContent } from './SharedContent';
import { PoliticalPerspectiveCarousel, PoliticalPerspective } from './PoliticalPerspectiveCarousel';
import { ChatInputLight } from '../Chat/ChatInputLight';
import { ChatScreen } from '../Chat';
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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Color variables - Light Theme
const colors = {
  default: '#1f2937', // Dark gray for text
  light: '#6b7280', // Light gray for secondary text
  background: '#ffffff', // White background
  surface: '#f9fafb', // Light gray surface
  border: '#e5e7eb', // Light border
};


interface ContentAnalysisSheetV2Props {
  content: string;
  analysis: any;
  isLoading?: boolean;
  isVisible: boolean;
  onClose: () => void;
  // Shared Content props
  sharedContent?: string;
  sharedContentType?: 'url' | 'text' | 'audio' | 'trending';
  sources?: Array<{
    title: string;
    url: string;
    domain: string;
    thumbnail?: string;
  }>;
  isTrendingAnalysis?: boolean;
}

export function ContentAnalysisSheetV2({
  content,
  analysis,
  isLoading = false,
  isVisible,
  onClose,
  sharedContent,
  sharedContentType,
  sources,
  isTrendingAnalysis = false
}: ContentAnalysisSheetV2Props) {
  // Bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const scrollViewRef = useRef<any>(null);

  // Narrative perspective state
  const [selectedPerspective, setSelectedPerspective] = useState<PoliticalPerspective | null>(null);
  const flipAnimation = useSharedValue(0);

  // Accordion state
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Tab and Chat state
  const [activeTab, setActiveTab] = useState<'analysis' | 'chat'>('analysis');
  const [initialChatMessage, setInitialChatMessage] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [chatKey, setChatKey] = useState(0);

  // Tab animation values
  const tabTransition = useSharedValue(0); // 0 = analysis, 1 = chat
  
  // Scroll animation values
  const scrollY = useSharedValue(0);
  const headerHeight = 250; // Height of full header
  const compactHeaderHeight = 60; // Height of compact header

  // Bottom sheet snap points - 80% and 95% for scrolling
  const snapPoints = useMemo(() => ['80%', '95%'], []);
  
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
    setActiveTab('chat');
    // Force re-mount of ChatScreen with new message
    setChatKey(prev => prev + 1);
  }, []);

  const handleTabChange = useCallback((tab: 'analysis' | 'chat') => {
    const targetValue = tab === 'analysis' ? 0 : 1;
    tabTransition.value = withTiming(targetValue, {
      duration: 300
    });
    setActiveTab(tab);
  }, [tabTransition]);

  // Swipe gesture handlers for tab switching
  const analysisPanGesture = Gesture.Pan()
    .minDistance(10)
    .activeOffsetX([-10, 10])
    .failOffsetY([-30, 30])
    .onEnd((event) => {
      const swipeThreshold = 30;
      const velocityThreshold = 300;
      const { translationX, velocityX, translationY } = event;

      // Only handle horizontal swipes
      if (Math.abs(translationY) > Math.abs(translationX)) {
        return;
      }

      // From analysis tab: only allow swipe left to chat
      if (Math.abs(translationX) > swipeThreshold || Math.abs(velocityX) > velocityThreshold) {
        if (translationX < 0 || velocityX < 0) {
          // Swipe left - go to chat tab
          runOnJS(handleTabChange)('chat');
        }
      }
    });

  const chatPanGesture = Gesture.Pan()
    .minDistance(10)
    .activeOffsetX([-10, 10])
    .failOffsetY([-30, 30])
    .onEnd((event) => {
      const swipeThreshold = 30;
      const velocityThreshold = 300;
      const { translationX, velocityX, translationY } = event;

      // Only handle horizontal swipes
      if (Math.abs(translationY) > Math.abs(translationX)) {
        return;
      }

      // From chat tab: only allow swipe right to analysis
      if (Math.abs(translationX) > swipeThreshold || Math.abs(velocityX) > velocityThreshold) {
        if (translationX > 0 || velocityX > 0) {
          // Swipe right - go to analysis tab
          runOnJS(handleTabChange)('analysis');
        }
      }
    });

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
      scrollY.value = 0;
      flipAnimation.value = 0;
      tabTransition.value = 0; // Reset tab animation
      setActiveTab('analysis');
      setChatMessages([]);
      setInitialChatMessage('');
      setChatKey(0);
      onClose();
    }
  }, [onClose, scrollY, flipAnimation, tabTransition]);


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

  // Create categorized accordion data structure
  const createAccordionData = (content: string) => {
    console.log('ContentAnalysisSheetV2 received content:', content);
    console.log('ContentAnalysisSheetV2 received analysis:', analysis);
    
    type DetectionItem = {
      id: string;
      icon: any;
      title: string;
      description: string;
      detailedContent: string;
      category: 'biases' | 'emotional' | 'logical' | 'credibility';
    };

    let items: DetectionItem[] = [];
    
    if (content.includes('who.int') || content.includes('COVID') || content.includes('covid')) {
      console.log('Detected COVID content');
      items = [
        {
          id: 'covid-misinfo',
          icon: require('../../assets/analysis-icons/covid-19.png'),
          title: 'COVID-19 Misinformation',
          description: 'Vaccine skepticism and anti-mandate rhetoric',
          detailedContent: 'This content promotes vaccine hesitancy by questioning safety data, spreading unverified claims about side effects, and portraying public health measures as authoritarian overreach. Common tactics include cherry-picking isolated cases, misrepresenting scientific studies, and appealing to personal freedom over collective health.',
          category: 'credibility'
        },
        {
          id: 'authority-appeal',
          icon: require('../../assets/analysis-icons/authority.png'),
          title: 'Appeal to Authority',
          description: 'Using "trust the science" without evidence',
          detailedContent: 'The content uses appeal to authority fallacies by invoking scientific credibility without providing actual evidence. Phrases like "trust the science" are used as conversation stoppers, while dissenting expert voices are dismissed or marginalized. This creates an illusion of scientific consensus where none may exist.',
          category: 'logical'
        },
        {
          id: 'fear-mongering',
          icon: require('../../assets/analysis-icons/fear.png'),
          title: 'Fear Mongering',
          description: 'Exaggerating dangers to influence behavior',
          detailedContent: 'Fear-based messaging amplifies worst-case scenarios to drive compliance with health measures. This includes highlighting rare adverse events, using apocalyptic language about virus variants, and creating anxiety about social consequences of non-compliance. The goal is emotional manipulation rather than rational persuasion.',
          category: 'emotional'
        },
        {
          id: 'govt-narrative',
          icon: require('../../assets/analysis-icons/government.png'),
          title: 'Government Narrative',
          description: 'Promoting official health policy positions',
          detailedContent: 'The content aligns closely with government health policies without acknowledging potential conflicts of interest or alternative viewpoints. Official statements are presented as unquestionable truth, and policy changes are framed as "following the science" rather than political or economic decisions.',
          category: 'biases'
        },
        {
          id: 'pharma-influence',
          icon: require('../../assets/analysis-icons/pharma.png'),
          title: 'Pharmaceutical Influence',
          description: 'Potential industry-backed messaging',
          detailedContent: 'The messaging shows potential pharmaceutical industry influence through uncritical promotion of medical interventions, downplaying of financial incentives, and exclusion of non-pharmaceutical solutions. Industry-funded studies are presented without disclosure of conflicts of interest.',
          category: 'biases'
        }
      ];
    } else if (content.includes('bbc.com') || content.includes('Hamas-Israel War')) {
      console.log('Detected Hamas-Israel content');
      items = [
        {
          id: 'conflict-misinfo',
          icon: require('../../assets/analysis-icons/government.png'),
          title: 'Conflict Misinformation',
          description: 'False casualty numbers and fabricated incidents',
          detailedContent: 'The content spreads unverified casualty figures, promotes debunked stories of atrocities, or presents staged incidents as authentic. This includes using old footage from other conflicts, misrepresenting civilian vs. military casualties, and amplifying unconfirmed reports without proper verification.',
          category: 'credibility'
        },
        {
          id: 'emotional-manipulation',
          icon: require('../../assets/analysis-icons/fear.png'),
          title: 'Emotional Manipulation',
          description: 'Using graphic imagery to trigger outrage',
          detailedContent: 'The content exploits human suffering through graphic images and videos designed to provoke immediate emotional responses rather than rational analysis. This includes sharing images of injured children, destroyed buildings, or grieving families to bypass critical thinking and generate support for one side.',
          category: 'emotional'
        },
        {
          id: 'selective-context',
          icon: require('../../assets/analysis-icons/framing.png'),
          title: 'Selective Context',
          description: 'Omitting key background information',
          detailedContent: 'The narrative deliberately excludes crucial context that would provide a more complete picture. This includes ignoring historical provocations, omitting details about military targets vs. civilian areas, or failing to mention the sequence of events leading to specific incidents.',
          category: 'biases'
        },
        {
          id: 'loaded-language',
          icon: require('../../assets/analysis-icons/inflamatory.png'),
          title: 'Loaded Language',
          description: '"Genocide", "ethnic cleansing", "apartheid"',
          detailedContent: 'The content employs emotionally charged terms that carry specific historical and legal meanings to describe current events. Words like "genocide" and "ethnic cleansing" are used without meeting their legal definitions, while terms like "apartheid" are applied anachronistically to inflame rather than inform.',
          category: 'emotional'
        },
        {
          id: 'false-equivalence',
          icon: require('../../assets/analysis-icons/authority.png'),
          title: 'False Moral Equivalence',
          description: 'Equating terrorist acts with self-defense',
          detailedContent: 'The content creates false moral equivalencies between targeted attacks on civilians and military responses to those attacks. This includes portraying terrorist organizations as freedom fighters or equating defensive military actions with offensive terrorism, obscuring important distinctions in international law.',
          category: 'logical'
        }
      ];
    } else if (content.includes('apnews.com') || content.includes('Anti-Gun Propaganda')) {
      console.log('Detected Anti-Gun content');
      items = [
        {
          id: 'tragedy-exploitation',
          icon: require('../../assets/analysis-icons/covid-19.png'),
          title: 'Tragedy Exploitation',
          description: 'Using fresh grief to push immediate legislation',
          detailedContent: 'The content capitalizes on mass shooting tragedies by demanding immediate policy action while emotions are high and rational debate is discouraged. This includes platforming grieving families as policy advocates, using "never again" rhetoric to shut down discussion, and framing any delay in legislation as complicity in future violence.',
          category: 'emotional'
        },
        {
          id: 'fear-mongering-guns',
          icon: require('../../assets/analysis-icons/fear.png'),
          title: 'Fear Mongering',
          description: '"Your children aren\'t safe at school"',
          detailedContent: 'The messaging amplifies parental fears by exaggerating the statistical risk of school shootings and portraying schools as war zones. This includes sensationalizing rare events, ignoring actual crime statistics, and creating anxiety that drives support for restrictive policies regardless of their effectiveness.',
          category: 'emotional'
        },
        {
          id: 'weaponized-language',
          icon: require('../../assets/analysis-icons/inflamatory.png'),
          title: 'Weaponized Language',
          description: '"Assault weapons", "weapons of war"',
          detailedContent: 'The content uses militaristic terminology to describe civilian firearms, creating false associations with battlefield weapons. Terms like "assault weapon" are used for cosmetic features rather than function, while "weapons of war" rhetoric ignores that many civilian firearms have military origins or applications.',
          category: 'emotional'
        },
        {
          id: 'statistical-manipulation',
          icon: require('../../assets/analysis-icons/authority.png'),
          title: 'Statistical Manipulation',
          description: 'Inflated gun violence numbers and cherry-picking',
          detailedContent: 'The content presents misleading statistics by including suicides in "gun violence" numbers, counting gang violence as mass shootings, or comparing countries with different demographics and crime patterns. Data is selectively presented to support predetermined conclusions while ignoring contradictory evidence.',
          category: 'logical'
        },
        {
          id: 'constitutional-gaslighting',
          icon: require('../../assets/analysis-icons/government.png'),
          title: 'Constitutional Gaslighting',
          description: '"Well regulated militia" misinterpretation',
          detailedContent: 'The content promotes outdated interpretations of the Second Amendment that have been rejected by Supreme Court precedent. This includes claiming the amendment only protects military service members, ignoring individual rights confirmed in Heller and McDonald decisions, or arguing the founders couldn\'t envision modern firearms.',
          category: 'biases'
        }
      ];
    } else {
      console.log('No specific content detected, using fallback');
      items = [
        {
          id: 'general-analysis',
          icon: require('../../assets/analysis-icons/unknown.png'),
          title: 'General Analysis',
          description: 'Various propaganda techniques detected',
          detailedContent: 'This content contains multiple propaganda techniques that require careful analysis. The messaging may include emotional appeals, selective presentation of facts, loaded language, or other persuasive techniques designed to influence opinion rather than inform. A more detailed analysis would require examination of specific claims and their supporting evidence.',
          category: 'biases'
        }
      ];
    }

    // Group items by category
    const categorizedData = {
      biases: {
        label: 'Biases',
        icon: 'eye-off-outline',
        items: items.filter(item => item.category === 'biases'),
      },
      emotional: {
        label: 'Emotional Manipulation',
        icon: 'heart-dislike-outline',
        items: items.filter(item => item.category === 'emotional'),
      },
      logical: {
        label: 'Logical Fallacies',
        icon: 'git-branch-outline',
        items: items.filter(item => item.category === 'logical'),
      },
      credibility: {
        label: 'Source Credibility',
        icon: 'shield-checkmark-outline',
        items: items.filter(item => item.category === 'credibility'),
      },
    };

    return categorizedData;
  };

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
      {/* Tab Navigation at the top */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'analysis' && styles.tabButtonActive]}
          onPress={() => handleTabChange('analysis')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'analysis' && styles.tabTextActive]}>
            Analysis
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'chat' && styles.tabButtonActive]}
          onPress={() => handleTabChange('chat')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
            Chat
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Container with Tab Animation */}
      <View style={{ flex: 1, position: 'relative' }}>
        {/* Analysis Tab Content */}
        <GestureDetector gesture={analysisPanGesture}>
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
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 280 }]}
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
                    content.includes('who.int') || content.includes('COVID') || content.includes('covid') 
                      ? require('../../assets/analysis-icons/covid-19.png')
                      : content.includes('bbc.com') || content.includes('Hamas-Israel War')
                      ? require('../../assets/analysis-icons/government.png')
                      : content.includes('apnews.com') || content.includes('Anti-Gun Propaganda')
                      ? require('../../assets/analysis-icons/anti-free-speech.png')
                      : require('../../assets/analysis-icons/unknown.png')
                  } 
                  style={[styles.headingIcon, iconStyle]}
                />
                <Animated.Text style={[styles.headingTitle, titleStyle]}>
                  {content.includes('who.int') || content.includes('COVID') || content.includes('covid') 
                    ? 'COVID-19 Propaganda'
                    : content.includes('bbc.com') || content.includes('Hamas-Israel War')
                    ? 'Hamas-Israel War Propaganda'
                    : content.includes('apnews.com') || content.includes('Anti-Gun Propaganda')
                    ? 'Anti-Gun Propaganda'
                    : 'Analysis Results'
                  }
                </Animated.Text>
                <Animated.Text style={[styles.headingDescription, descriptionStyle]}>
                  {content.includes('who.int') || content.includes('COVID') || content.includes('covid') 
                    ? 'Identifying misinformation and propaganda techniques\nin COVID-19 related content'
                    : content.includes('bbc.com') || content.includes('Hamas-Israel War')
                    ? 'Analyzing propaganda and bias in conflict-related content'
                    : content.includes('apnews.com') || content.includes('Anti-Gun Propaganda')
                    ? 'Detecting emotional manipulation in gun control messaging'
                    : 'Detailed propaganda analysis of the content'
                  }
                </Animated.Text>
              </Animated.View>

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
                {(() => {
                  const categorizedData = createAccordionData(content);
                  return Object.entries(categorizedData).map(([categoryKey, category]) => {
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
                  });
                })()}
              </View>
            </View>
            </>
          )}
            </BottomSheetScrollView>
          </Animated.View>
        </GestureDetector>

        {/* Chat Tab Content */}
        <GestureDetector gesture={chatPanGesture}>
          <Animated.View style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: activeTab === 'chat' ? 1 : 0
            },
            chatTabStyle
          ]}>
            <View style={styles.chatContentWrapper}>
              <ChatScreen
                key={`chat-${chatKey}`}
                aiApiKey={process.env.EXPO_PUBLIC_OPENAI_API_KEY}
                aiModel="gpt-3.5-turbo"
                enableImages={true}
                initialUserMessage={initialChatMessage ? initialChatMessage : undefined}
                onSendMessage={(message) => {
                  console.log('Analysis chat message sent:', message);
                  setChatMessages(prev => [...prev, message]);
                }}
              />
            </View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Chat Input - Only visible in analysis tab */}
      {activeTab === 'analysis' && (
        <View style={styles.fixedChatInputContainer}>
          <ChatInputLight
            onSubmit={handleChatSubmit}
            placeholder="Ask about this content..."
          />
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
    marginTop: 60,
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  chatTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.default,
  },
  chatCloseButton: {
    padding: 8,
  },
  chatContent: {
    flex: 1,
    marginTop: 60,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  chatContentWrapper: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 100,
    backgroundColor: 'transparent',
  },
  chatPlaceholder: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  tabContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    height: 60,
    paddingHorizontal: 20,
    zIndex: 200,
    elevation: 200,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.6)',
    marginBottom: -1,
  },
  tabText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  tabTextActive: {
    color: 'rgba(0, 0, 0, 0.8)',
  },
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