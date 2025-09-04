import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { fonts } from '../../constants/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type PoliticalPerspective = 'left' | 'center' | 'right' | 'libertarian' | 'authoritarian';

interface PerspectiveButton {
  id: PoliticalPerspective;
  label: string;
  icon: string;
  iconFamily: 'ionicons' | 'material-community' | 'font-awesome-5';
  color: string;
  backgroundColor: string;
}

const perspectives: PerspectiveButton[] = [
  {
    id: 'left',
    label: 'Left',
    icon: 'democrat',
    iconFamily: 'font-awesome-5',
    color: '#FFFFFF',
    backgroundColor: '#2196F3',
  },
  {
    id: 'center',
    label: 'Center',
    icon: 'balance-scale',
    iconFamily: 'font-awesome-5',
    color: '#FFFFFF',
    backgroundColor: '#9C27B0',
  },
  {
    id: 'right',
    label: 'Right',
    icon: 'republican',
    iconFamily: 'font-awesome-5',
    color: '#FFFFFF',
    backgroundColor: '#F44336',
  },
  {
    id: 'libertarian',
    label: 'Libertarian',
    icon: 'snake',
    iconFamily: 'material-community',
    color: '#FFFFFF',
    backgroundColor: '#FFC107',
  },
  {
    id: 'authoritarian',
    label: 'Authoritarian',
    icon: 'crown',
    iconFamily: 'material-community',
    color: '#FFFFFF',
    backgroundColor: '#607D8B',
  },
];

interface PoliticalPerspectiveCarouselProps {
  selectedPerspective: PoliticalPerspective | null;
  onPerspectiveSelect: (perspective: PoliticalPerspective) => void;
}

export function PoliticalPerspectiveCarousel({
  selectedPerspective,
  onPerspectiveSelect,
}: PoliticalPerspectiveCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  const renderIcon = (button: PerspectiveButton) => {
    const iconProps = {
      size: 20,
      color: button.color,
    };

    switch (button.iconFamily) {
      case 'material-community':
        return <MaterialCommunityIcons name={button.icon as any} {...iconProps} />;
      case 'font-awesome-5':
        return <FontAwesome5 name={button.icon as any} {...iconProps} />;
      case 'ionicons':
      default:
        return <Ionicons name={button.icon as any} {...iconProps} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select perspective to re-spin narrative:</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {perspectives.map((perspective) => (
          <TouchableOpacity
            key={perspective.id}
            style={[
              styles.perspectiveButton,
              { backgroundColor: perspective.backgroundColor },
              selectedPerspective === perspective.id && styles.selectedButton,
            ]}
            onPress={() => onPerspectiveSelect(perspective.id)}
            activeOpacity={0.8}
          >
            {renderIcon(perspective)}
            <Text style={[styles.buttonText, { color: perspective.color }]}>
              {perspective.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 12,
  },
  scrollView: {
    marginHorizontal: -10,
  },
  scrollContent: {
    paddingHorizontal: 10,
    gap: 10,
  },
  perspectiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedButton: {
    transform: [{ scale: 1.05 }],
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
});