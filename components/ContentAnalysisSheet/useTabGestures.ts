/**
 * Custom hook for tab switching gestures and animations
 */
import { useCallback } from 'react';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { ANIMATION_CONFIG } from './constants';

export type TabType = 'analysis' | 'chat';

interface UseTabGesturesProps {
  onTabChange: (tab: TabType) => void;
}

export function useTabGestures({ onTabChange }: UseTabGesturesProps) {
  const tabTransition = useSharedValue(0); // 0 = analysis, 1 = chat

  const handleTabChange = useCallback((tab: TabType) => {
    const targetValue = tab === 'analysis' ? 0 : 1;
    tabTransition.value = withTiming(targetValue, {
      duration: ANIMATION_CONFIG.TAB_TRANSITION_DURATION
    });
    onTabChange(tab);
  }, [tabTransition, onTabChange]);

  // Reusable gesture creator
  const createPanGesture = useCallback((allowedDirection: 'left' | 'right' | 'both') => {
    return Gesture.Pan()
      .minDistance(ANIMATION_CONFIG.MIN_DISTANCE)
      .activeOffsetX([-ANIMATION_CONFIG.ACTIVE_OFFSET_X, ANIMATION_CONFIG.ACTIVE_OFFSET_X])
      .failOffsetY([-ANIMATION_CONFIG.FAIL_OFFSET_Y, ANIMATION_CONFIG.FAIL_OFFSET_Y])
      .onEnd((event) => {
        const { translationX, velocityX, translationY } = event;

        // Only handle horizontal swipes
        if (Math.abs(translationY) > Math.abs(translationX)) {
          return;
        }

        // Check if it's a significant enough swipe
        const isSignificantSwipe =
          Math.abs(translationX) > ANIMATION_CONFIG.SWIPE_THRESHOLD ||
          Math.abs(velocityX) > ANIMATION_CONFIG.VELOCITY_THRESHOLD;

        if (!isSignificantSwipe) return;

        const isSwipeLeft = translationX < 0 || velocityX < 0;
        const isSwipeRight = translationX > 0 || velocityX > 0;

        // Handle direction-specific gestures
        if (allowedDirection === 'left' && isSwipeLeft) {
          runOnJS(handleTabChange)('chat');
        } else if (allowedDirection === 'right' && isSwipeRight) {
          runOnJS(handleTabChange)('analysis');
        } else if (allowedDirection === 'both') {
          if (isSwipeLeft) {
            runOnJS(handleTabChange)('chat');
          } else if (isSwipeRight) {
            runOnJS(handleTabChange)('analysis');
          }
        }
      });
  }, [handleTabChange]);

  // Specific gesture instances
  const analysisPanGesture = createPanGesture('left');
  const chatPanGesture = createPanGesture('right');

  const resetTabAnimation = useCallback(() => {
    tabTransition.value = 0;
  }, [tabTransition]);

  return {
    tabTransition,
    handleTabChange,
    analysisPanGesture,
    chatPanGesture,
    resetTabAnimation,
  };
}