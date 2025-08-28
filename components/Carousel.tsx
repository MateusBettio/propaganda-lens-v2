import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { Button } from './Button';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.8;
const CARD_MARGIN = 10;

export interface CarouselItem {
  id: string;
  image: string;
  title: string;
  description: string;
  timestamp: string;
}

interface CarouselProps {
  onItemPress?: (item: CarouselItem) => void;
}

const placeholderItems: CarouselItem[] = [
  {
    id: '1',
    image: 'https://picsum.photos/400/225?random=1',
    title: 'Political Speech Analysis',
    description: 'Detected 5 propaganda techniques including emotional manipulation and loaded language in recent political speech about economic policy',
    timestamp: '2 hours ago',
  },
  {
    id: '2', 
    image: 'https://picsum.photos/400/225?random=2',
    title: 'News Article Review',
    description: 'Identified emotional manipulation and loaded language in viral news article about climate change',
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    image: 'https://picsum.photos/400/225?random=3',
    title: 'Satire Detection',
    description: 'Content identified as satire - found exaggeration and irony techniques in trending social media post',
    timestamp: '1 day ago',
  },
];

export function Carousel({ onItemPress }: CarouselProps) {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const styles = createStyles(colors);
  
  const handleViewAnalysis = (item: CarouselItem) => {
    console.log('View analysis:', item.id);
    if (onItemPress) {
      onItemPress(item);
    }
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
              <Button 
                variant="primary"
                size="medium"
                title="View Analysis"
                onPress={() => handleViewAnalysis(item)}
                style={styles.button}
              />
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
    alignSelf: 'flex-start',
  },
  });
}