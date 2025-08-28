import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useAnimatedProps,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

interface CustomBackdropProps extends BottomSheetBackdropProps {
  enableBackdropPressToClose?: boolean;
  onClose?: () => void;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CustomBackdrop: React.FC<CustomBackdropProps> = ({
  animatedIndex,
  style,
  enableBackdropPressToClose = true,
  onClose,
}) => {
  const containerAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(
        animatedIndex.value,
        [-1, 0],
        [0, 1],
        Extrapolate.CLAMP
      ),
    };
  });

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    return {
      intensity: interpolate(
        animatedIndex.value,
        [-1, 0],
        [0, 25],
        Extrapolate.CLAMP
      ),
    };
  });

  const combinedStyles = useMemo(
    () => [styles.container, style, containerAnimatedStyle],
    [style, containerAnimatedStyle]
  );

  return (
    <AnimatedPressable
      style={combinedStyles}
      onPress={enableBackdropPressToClose ? onClose : undefined}
      disabled={!enableBackdropPressToClose}
    >
      <AnimatedBlurView
        style={StyleSheet.absoluteFillObject}
        animatedProps={animatedProps}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
      />
      <Animated.View style={[styles.overlay, containerAnimatedStyle]} />
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});