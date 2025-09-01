import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../constants/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = 200;
const RADIUS = 100;

interface CircularGalleryItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  content: React.ReactNode;
}

interface CircularGalleryProps {
  items: CircularGalleryItem[];
  analysis?: any;
  onShare?: () => void;
}

export function CircularGallery({ items, analysis, onShare }: CircularGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const rotationValue = useRef(new Animated.Value(0)).current;
  const scaleValues = useRef(
    items.map(() => new Animated.Value(0.8))
  ).current;

  // Calculate positions for items in circle
  const getItemPosition = (index: number, totalItems: number) => {
    const angle = (index * 2 * Math.PI) / totalItems - Math.PI / 2;
    const x = CENTER_X + RADIUS * Math.cos(angle);
    const y = CENTER_Y + RADIUS * Math.sin(angle);
    return { x, y, angle };
  };

  const animateToIndex = (index: number) => {
    setActiveIndex(index);
    
    // Animate rotation
    Animated.spring(rotationValue, {
      toValue: index,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Animate scales
    scaleValues.forEach((scale, i) => {
      Animated.spring(scale, {
        toValue: i === index ? 1 : 0.8,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    });
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      const angle = Math.atan2(gestureState.dy, gestureState.dx);
      const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);
      const targetIndex = Math.round(normalizedAngle * items.length) % items.length;
      
      if (targetIndex !== activeIndex) {
        animateToIndex(targetIndex);
      }
    },
  });

  const renderCircularItems = () => {
    return items.map((item, index) => {
      const position = getItemPosition(index, items.length);
      const isActive = index === activeIndex;
      
      const rotateZ = rotationValue.interpolate({
        inputRange: [0, items.length],
        outputRange: ['0deg', `${360}deg`],
      });

      return (
        <Animated.View
          key={item.id}
          style={[
            styles.circularItem,
            {
              left: position.x - 30,
              top: position.y - 30,
              transform: [
                { scale: scaleValues[index] },
                { rotateZ },
              ],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => animateToIndex(index)}
            style={[
              styles.circularButton,
              { backgroundColor: isActive ? '#007AFF' : '#f0f0f0' },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={isActive ? '#fff' : '#666'}
            />
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  const renderActiveCard = () => {
    const activeItem = items[activeIndex];
    
    return (
      <Animated.View
        style={[
          styles.activeCard,
          {
            opacity: rotationValue.interpolate({
              inputRange: [activeIndex - 0.5, activeIndex, activeIndex + 0.5],
              outputRange: [0.5, 1, 0.5],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Ionicons name={activeItem.icon} size={20} color="#007AFF" />
          <Text style={styles.cardTitle}>{activeItem.title}</Text>
        </View>
        {activeItem.content}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Circular Navigation */}
      <View style={styles.circularContainer} {...panResponder.panHandlers}>
        <View style={styles.centerDot} />
        {renderCircularItems()}
      </View>

      {/* Active Card Content */}
      {renderActiveCard()}

      {/* Navigation Dots */}
      <View style={styles.dotsContainer}>
        {items.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => animateToIndex(index)}
            style={[
              styles.dot,
              { backgroundColor: index === activeIndex ? '#007AFF' : '#d0d0d0' },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// Helper function to create the three cards content
export function createAnalysisCards(analysis: any, onShare: () => void): CircularGalleryItem[] {
  return [
    {
      id: 'summary',
      icon: 'bar-chart-outline',
      title: 'Analysis Summary',
      content: (
        <View style={styles.summaryItems}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Techniques Detected</Text>
            <Text style={styles.summaryValue}>
              {analysis?.techniques?.length || 0}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Confidence Score</Text>
            <Text style={styles.summaryValue}>
              {Math.round((analysis?.confidence || 0) * 100)}%
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Risk Level</Text>
            <Text style={[styles.summaryValue, { 
              color: (analysis?.confidence || 0) > 0.7 ? '#ff4444' : 
                    (analysis?.confidence || 0) > 0.4 ? '#ff9800' : '#4caf50' 
            }]}>
              {(analysis?.confidence || 0) > 0.7 ? 'High' : 
               (analysis?.confidence || 0) > 0.4 ? 'Medium' : 'Low'}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'narrative',
      icon: 'document-text-outline',
      title: 'The Narrative',
      content: (
        <View>
          <Text style={styles.narrativeText}>
            {analysis?.summary || 'This content has been analyzed for potential propaganda techniques. The analysis examines language patterns, emotional appeals, and persuasive strategies commonly used in manipulative content.'}
          </Text>
          {analysis?.techniques && analysis.techniques.length > 0 && (
            <View style={styles.techniquesList}>
              <Text style={styles.techniquesTitle}>Key Techniques:</Text>
              {analysis.techniques.slice(0, 3).map((technique: any, index: number) => (
                <Text key={index} style={styles.techniqueItem}>
                  • {technique.name}
                </Text>
              ))}
            </View>
          )}
        </View>
      ),
    },
    {
      id: 'share',
      icon: 'share-outline',
      title: 'Share This Analysis',
      content: (
        <View>
          <Text style={styles.shareDescription}>
            Help others understand media literacy by sharing this analysis
          </Text>
          <TouchableOpacity style={styles.shareButton} onPress={onShare}>
            <Ionicons name="share" size={16} color="#fff" />
            <Text style={styles.shareButtonText}>Share Analysis</Text>
          </TouchableOpacity>
        </View>
      ),
    },
  ];
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  circularContainer: {
    height: 400,
    position: 'relative',
    marginBottom: 20,
  },
  centerDot: {
    position: 'absolute',
    left: CENTER_X - 5,
    top: CENTER_Y - 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  circularItem: {
    position: 'absolute',
    width: 60,
    height: 60,
  },
  circularButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    minHeight: 200,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#333',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryItems: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#007AFF',
  },
  narrativeText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
  },
  techniquesList: {
    marginTop: 8,
  },
  techniquesTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#333',
    marginBottom: 8,
  },
  techniqueItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  shareDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
});