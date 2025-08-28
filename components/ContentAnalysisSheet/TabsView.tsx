import React, { useState, useRef } from 'react';
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
} from 'react-native-reanimated';

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
  const scrollViewRef = useRef<ScrollView>(null);
  const tabScrollRef = useRef<ScrollView>(null);

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    onTabChange?.(index);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / screenWidth);
    
    if (newIndex !== activeTab && newIndex >= 0 && newIndex < tabs.length) {
      setActiveTab(newIndex);
      onTabChange?.(newIndex);
    }
  };

  // Calculate tab width - fixed width for each tab
  const TAB_WIDTH = 120;

  return (
    <View style={styles.container}>
      {/* Tab Headers */}
      <ScrollView 
        ref={tabScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab, index) => (
          <Pressable
            key={tab.id}
            style={[styles.tab, index === activeTab && styles.activeTab]}
            onPress={() => handleTabPress(index)}
          >
            <Text style={[styles.tabText, index === activeTab && styles.activeTabText]}>
              {tab.label}
            </Text>
            {index === activeTab && <View style={styles.tabIndicator} />}
          </Pressable>
        ))}
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
    borderBottomColor: '#E5E7EB',
    maxHeight: 56,
  },
  tabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    position: 'relative',
    minWidth: 120,
  },
  activeTab: {
    // Active tab styles handled by text color and indicator
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
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