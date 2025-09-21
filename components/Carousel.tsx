import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { Button } from './Button';
import { fonts } from '../constants/fonts';
import { Badge } from './Badge';
import { AnalysisIcon } from './AnalysisIcon';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.5;
const CARD_HEIGHT = CARD_WIDTH * 1.4;
const CARD_MARGIN = 20;

export interface CarouselItem {
  id: string;
  image: string;
  title: string;
  description: string;
  timestamp: string;
  url: string;
  propagandaType?: string;
  analysisIconType?: 'covid-19' | 'war-complex' | 'gun-control' | 'chinese-propaganda' | 'islam-propaganda' | 'nazi-propaganda' | 'russian-propaganda' | 'warming';
}

interface CarouselProps {
  onItemPress?: (item: CarouselItem) => void;
}

const placeholderItems: CarouselItem[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?ixlib=rb-4.0.3&w=400&h=225&fit=crop',
    title: 'COVID-19 Misinformation',
    description: 'Detected multiple propaganda techniques including fear appeals and false authority in social media posts spreading COVID-19 conspiracy theories',
    timestamp: '2 hours ago',
    url: 'https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters',
    propagandaType: 'COVID-19 Propaganda',
    analysisIconType: 'covid-19',
  },
  {
    id: '2', 
    image: 'https://images.unsplash.com/photo-1526554850534-7c78330d5f90?ixlib=rb-4.0.3&w=400&h=225&fit=crop',
    title: 'Hamas-Israel War',
    description: 'Detected propaganda techniques including emotional manipulation and selective framing in social media posts about the conflict',
    timestamp: '5 hours ago',
    url: 'https://www.bbc.com/news/world-middle-east-67039975',
    propagandaType: 'War Propaganda',
    analysisIconType: 'war-complex',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&w=400&h=225&fit=crop',
    title: 'Anti-Gun Propaganda',
    description: 'Identified fear appeals and loaded language in media coverage following mass shooting incident',
    timestamp: '1 day ago',
    url: 'https://apnews.com/hub/gun-violence',
    propagandaType: 'Gun Control Propaganda',
    analysisIconType: 'gun-control',
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
        Trending this week
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
            style={styles.card}
            onPress={() => handleViewAnalysis(item)}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.image} />
              {item.propagandaType && item.analysisIconType && (
                <Badge
                  text={item.propagandaType}
                  icon={<AnalysisIcon type={item.analysisIconType} size={14} />}
                  theme="light"
                  style={styles.badge}
                />
              )}
            </View>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {item.timestamp}
            </Text>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
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
    fontSize: 32,
    fontFamily: fonts.serifRegular,
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
  },
  imageContainer: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginBottom: 6,
    lineHeight: 24,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  });
}