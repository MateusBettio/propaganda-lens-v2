import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionBarProps {
  onCleanse?: () => void;
  onCounter?: () => void;
  onRepeat?: () => void;
  onShare?: () => void;
}

interface ActionButton {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = React.memo(({
  onCleanse,
  onCounter,
  onRepeat,
  onShare,
}) => {
  const actions: ActionButton[] = [
    {
      id: 'cleanse',
      title: 'Cleanse',
      icon: 'create-outline',
      onPress: onCleanse,
    },
    {
      id: 'counter',
      title: 'Counter',
      icon: 'link-outline',
      onPress: onCounter,
    },
    {
      id: 'repeat',
      title: 'Repeat',
      icon: 'refresh-outline',
      onPress: onRepeat,
    },
    {
      id: 'share',
      title: 'Share',
      icon: 'share-outline',
      onPress: onShare,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            style={styles.actionButton}
            onPress={action.onPress}
          >
            <View style={styles.iconCircle}>
              <Ionicons 
                name={action.icon} 
                size={24} 
                color="#FFFFFF" 
              />
            </View>
            <Text style={styles.actionLabel}>{action.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
});