import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../constants/fonts';

interface TechniquesListProps {
  onTechniquePress?: (technique: TechniqueItem) => void;
}

interface TechniqueItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const mockTechniques: TechniqueItem[] = [
  {
    id: '1',
    title: 'Government Narrative',
    description: 'The government is invested in this story',
    icon: 'business-outline',
  },
  {
    id: '2',
    title: 'Inflammatory Language',
    description: 'Used language that is emotional',
    icon: 'flame-outline',
  },
  {
    id: '3',
    title: 'Appeal to Authority',
    description: 'Made references to credible sources',
    icon: 'medal-outline',
  },
  {
    id: '4',
    title: 'False Dichotomy',
    description: 'Presents only two options when more exist',
    icon: 'git-branch-outline',
  },
  {
    id: '5',
    title: 'Emotional Manipulation',
    description: 'Uses fear, anger, or other emotions to influence',
    icon: 'heart-outline',
  },
  {
    id: '6',
    title: 'Cherry Picking',
    description: 'Selectively presents facts that support the narrative',
    icon: 'leaf-outline',
  },
  {
    id: '7',
    title: 'Loaded Language',
    description: 'Uses words with strong emotional implications',
    icon: 'chatbubble-outline',
  },
  {
    id: '8',
    title: 'Bandwagon Effect',
    description: 'Appeals to popularity or what everyone else is doing',
    icon: 'people-outline',
  },
  {
    id: '9',
    title: 'Straw Man Argument',
    description: 'Misrepresents opposing viewpoints to make them easier to attack',
    icon: 'construct-outline',
  },
  {
    id: '10',
    title: 'Ad Hominem Attack',
    description: 'Attacks the person making the argument rather than the argument itself',
    icon: 'person-outline',
  },
  {
    id: '11',
    title: 'Confirmation Bias',
    description: 'Seeks information that confirms existing beliefs',
    icon: 'checkmark-circle-outline',
  },
  {
    id: '12',
    title: 'Slippery Slope',
    description: 'Suggests that one event will lead to extreme consequences',
    icon: 'trending-down-outline',
  },
];

export const TechniquesList: React.FC<TechniquesListProps> = React.memo(({
  onTechniquePress
}) => {
  return (
    <View style={styles.container}>
      {mockTechniques.map((technique) => (
        <Pressable
          key={technique.id}
          style={styles.techniqueItem}
          onPress={() => onTechniquePress?.(technique)}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name={technique.icon} 
              size={24} 
              color="#6B7280" 
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>{technique.title}</Text>
            <Text style={styles.description}>{technique.description}</Text>
          </View>
          
          <View style={styles.arrowContainer}>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color="#9CA3AF" 
            />
          </View>
        </Pressable>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  techniqueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#111827',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: 8,
  },
});