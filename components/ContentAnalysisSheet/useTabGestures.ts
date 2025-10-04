/**
 * Custom hook for tab switching animations (gestures removed)
 */
import { useCallback } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
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

  // Removed gesture handling - tabs now switch via chat interactions only

  const resetTabAnimation = useCallback(() => {
    tabTransition.value = 0;
  }, [tabTransition]);

  return {
    tabTransition,
    handleTabChange,
    resetTabAnimation,
  };
}