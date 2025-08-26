import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { useTheme } from '../contexts/theme-context';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.8;
const CARD_MARGIN = 10;

interface CarouselItem {
  id: string;
  image: string;
  title: string;
  description: string;
  timestamp: string;
}

const placeholderItems: CarouselItem[] = [
  {
    id: '1',
    image: 'https://via.placeholder.com/400x225/4a5568/ffffff?text=Analysis+1',
    title: 'Political Speech Analysis',
    description: 'Detected 5 propaganda techniques in recent political speech about economic policy',
    timestamp: '2 hours ago',
  },
  {
    id: '2', 
    image: 'https://via.placeholder.com/400x225/6366f1/ffffff?text=Analysis+2',
    title: 'News Article Review',
    description: 'Identified emotional manipulation and loaded language in viral news article',
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    image: 'https://via.placeholder.com/400x225/8b5cf6/ffffff?text=Analysis+3',
    title: 'Social Media Post Check',
    description: 'Found bandwagon and false dichotomy techniques in trending social post',
    timestamp: '1 day ago',
  },
];

export function Carousel() {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const styles = createStyles(colors);
  
  const handleViewAnalysis = (item: CarouselItem) => {
    console.log('View analysis:', item.id);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Trending Analysis
      </Text>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {placeholderItems.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => handleViewAnalysis(item)}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                {item.timestamp}
              </Text>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.description}
              </Text>
              <Pressable 
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => handleViewAnalysis(item)}
              >
                <Text style={styles.buttonText}>View Analysis</Text>
              </Pressable>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  card: {
    width: CARD_WIDTH,
    marginLeft: 0,
    marginRight: CARD_MARGIN,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.border,
  },
  cardContent: {
    padding: 16,
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
    alignSelf: 'flex-start',
    height: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.primary === colors.white ? colors.black : colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  });
}