import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { fonts } from '../../constants/fonts';

const { width: screenWidth } = Dimensions.get('window');

interface Tab {
  id: string;
  label: string;
}

interface TabsViewProps {
  tabs: Tab[];
  children: React.ReactNode[];
  initialTab?: number;
  onTabChange?: (index: number) => void;
}

export const TabsView: React.FC<TabsViewProps> = React.memo(({
  tabs,
  children,
  initialTab = 0,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const tabScrollRef = useRef<ScrollView>(null);
  const indicatorPosition = useSharedValue(initialTab);

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    indicatorPosition.value = withTiming(index, { duration: 300 });
    scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    onTabChange?.(index);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const progress = offsetX / screenWidth;
    const newIndex = Math.round(progress);
    
    // Update indicator position smoothly based on scroll progress
    indicatorPosition.value = progress;
    
    if (newIndex !== activeTab && newIndex >= 0 && newIndex < tabs.length) {
      setActiveTab(newIndex);
      onTabChange?.(newIndex);
    }
  };

  useEffect(() => {
    if (tabLayouts.length === 0 || !tabLayouts[activeTab]) return;
    
    const activeTabLayout = tabLayouts[activeTab];
    const tabCenterX = activeTabLayout.x + (activeTabLayout.width / 2);
    const screenCenterX = screenWidth / 2;
    const scrollToX = tabCenterX - screenCenterX;
    
    tabScrollRef.current?.scrollTo({
      x: Math.max(0, scrollToX),
      animated: true
    });
  }, [activeTab, tabLayouts]);

  const handleTabLayout = (index: number, event: any) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts(prev => {
      const newLayouts = [...prev];
      newLayouts[index] = { x, width };
      return newLayouts;
    });
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    if (tabLayouts.length === 0) return { opacity: 0 };
    
    const progress = indicatorPosition.value;
    const currentIndex = Math.floor(progress);
    const nextIndex = Math.min(currentIndex + 1, tabs.length - 1);
    const fraction = progress - currentIndex;
    
    const currentLayout = tabLayouts[currentIndex];
    const nextLayout = tabLayouts[nextIndex];
    
    if (!currentLayout || !nextLayout) return { opacity: 0 };
    
    // Interpolate position and width
    const translateX = interpolate(
      fraction,
      [0, 1],
      [currentLayout.x + 16, nextLayout.x + 16], // Add padding offset
      'clamp'
    );
    
    const width = interpolate(
      fraction,
      [0, 1],
      [currentLayout.width - 32, nextLayout.width - 32], // Subtract padding
      'clamp'
    );
    
    return {
      opacity: 1,
      width,
      transform: [{ translateX }],
    };
  });

  // Calculate tab width - fixed width for each tab
  const TAB_WIDTH = 120;

  return (
    <View style={styles.container}>
      {/* Tab Headers */}
      <ScrollView 
        ref={tabScrollRef}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        bounces={true}
        style={styles.tabsContainer}
        contentContainerStyle={[styles.tabsContent, { minWidth: tabs.length * 108 + 32 }]}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {tabs.map((tab, index) => (
          <Pressable
            key={tab.id}
            style={[styles.tab, index === activeTab && styles.activeTab]}
            onPress={() => handleTabPress(index)}
            onLayout={(event) => handleTabLayout(index, event)}
          >
            <Text style={[styles.tabText, index === activeTab && styles.activeTabText]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
        {/* Single Animated Indicator */}
        <Animated.View style={[styles.slidingIndicator, animatedIndicatorStyle]} />
      </ScrollView>

      {/* Tab Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.contentContainer}
      >
        {children.map((child, index) => (
          <View key={index} style={styles.tabContent}>
            {child}
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
    maxHeight: 56,
    overflow: 'visible',
  },
  tabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    position: 'relative',
    minWidth: 100,
    marginHorizontal: 4,
  },
  activeTab: {
    // Active tab styles handled by text color and indicator
  },
  tabText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#6B7280',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#111827',
    fontFamily: fonts.semiBold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: '#000000',
  },
  slidingIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    width: screenWidth,
    flex: 1,
  },
});