import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface BadgeProps {
  text: string;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  theme?: 'light' | 'dark';
  style?: ViewStyle;
}

export function Badge({ 
  text, 
  icon, 
  iconPosition = 'start', 
  theme = 'light',
  style 
}: BadgeProps) {
  const isDark = theme === 'dark';
  
  return (
    <View style={[styles.container, style]}>
      <BlurView 
        intensity={20} 
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <View style={[
          styles.content,
          isDark ? styles.contentDark : styles.contentLight
        ]}>
          {icon && iconPosition === 'start' && (
            <View style={styles.iconContainer}>{icon}</View>
          )}
          <Text style={[
            styles.text,
            isDark ? styles.textDark : styles.textLight
          ]}>
            {text}
          </Text>
          {icon && iconPosition === 'end' && (
            <View style={styles.iconContainer}>{icon}</View>
          )}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  blurContainer: {
    borderRadius: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  contentLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  contentDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  iconContainer: {
    width: 16,
    height: 16,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textLight: {
    color: '#000000',
  },
  textDark: {
    color: '#FFFFFF',
  },
});