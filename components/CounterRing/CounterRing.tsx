/**
 * CounterRing - High-quality tri-platform React Native component
 * 
 * A compact dark-UI widget showing a progress ring with centered number and left label.
 * Ring starts FILLED and empties as credits are used (inverted progress behavior).
 * Supports controlled/uncontrolled modes, smooth animations, accessibility, and persistence.
 * 
 * Props:
 * - label: Left-side text label (e.g. "Free Analysis")
 * - value: Current remaining credits (controlled mode)
 * - defaultValue: Starting credits for uncontrolled mode (default 10)
 * - max: Upper bound defining 100% filled ring (default 10)
 * - size: Ring diameter in dp/px (default 44)
 * - thickness: Stroke width (default 5)
 * - Colors with dark-mode defaults
 * - animate: Enable ring animation (default true)
 * - persistenceKey: AsyncStorage key for persistence
 * 
 * Math: progress = value / max (inverted), strokeDashoffset = circumference * (1 - progress)
 * Animation: 380ms ease-out via requestAnimationFrame, respects reduced motion
 * 
 * Examples:
 * // Uncontrolled with persistence - starts with full ring at 10,000
 * const ref = useRef<CounterRingHandle>(null);
 * <CounterRing ref={ref} label="Free Analysis" defaultValue={10000} persistenceKey="credits" />
 * ref.current?.decrement(); // ring empties as number decreases
 * 
 * // Controlled
 * const [credits, setCredits] = useState(10000);
 * <CounterRing label="Free Analysis" value={credits} onChange={setCredits} />
 */

import React, { 
  forwardRef, 
  useImperativeHandle, 
  useState, 
  useEffect, 
  useRef, 
  useMemo, 
  useCallback 
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  AccessibilityInfo,
  Platform
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useCreditsCounter } from './useCreditsCounter';

export type CounterRingProps = {
  /** Left label, e.g., "Free Analysis" */
  label: string;
  /** Current remaining credits to display (controlled mode) */
  value?: number;
  /** Starting credits for uncontrolled mode; default 10 */
  defaultValue?: number;
  /** Upper bound that defines 100%; default 10 */
  max?: number;
  /** Ring diameter in dp/px; default 44 */
  size?: number;
  /** Stroke width; default 5 */
  thickness?: number;
  /** Colors (dark-mode sensible defaults) */
  trackColor?: string;     // default rgba(255,255,255,0.12)
  progressColor?: string;  // default rgba(255,255,255,0.92) - now represents remaining
  textColor?: string;      // default #FFFFFF
  labelColor?: string;     // default #C9C9C9
  /** Animate ring changes; default true */
  animate?: boolean;
  /** Clamp visual progress to [0..100%]; default true */
  clamp?: boolean;
  /** Optional web aria label override */
  ariaLabel?: string;
  /** ClassName for RN Web; safe to ignore on native */
  className?: string;
  /** Persist remaining credits by key (uses AsyncStorage if available) */
  persistenceKey?: string;
  /** Callbacks */
  onChange?(remaining: number): void;
  onExhausted?(): void; // fire exactly when remaining hits 0
};

export type CounterRingHandle = {
  decrement(step?: number): void; // default 1
  increment(step?: number): void;
  reset(to?: number): void;       // default max
  getValue(): number;
};

const CounterRing = forwardRef<CounterRingHandle, CounterRingProps>(
  ({
    label,
    value: controlledValue,
    defaultValue = 10,
    max = 10,
    size = 44,
    thickness = 5,
    trackColor = 'rgba(255,255,255,0.12)',
    progressColor = 'rgba(255,255,255,0.92)',
    textColor = '#FFFFFF',
    labelColor = '#C9C9C9',
    animate = true,
    clamp = true,
    ariaLabel,
    className,
    persistenceKey,
    onChange,
    onExhausted
  }, ref) => {

    const isControlled = controlledValue !== undefined;
    
    // Uncontrolled state management via hook
    const uncontrolledState = useCreditsCounter(defaultValue, {
      max,
      onChange: !isControlled ? onChange : undefined,
      onExhausted: !isControlled ? onExhausted : undefined,
      persistenceKey: !isControlled ? persistenceKey : undefined
    });

    // Current value (controlled or uncontrolled)
    const currentValue = isControlled ? controlledValue : uncontrolledState.value;

    // Animation state
    const [displayValue, setDisplayValue] = useState(currentValue);
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const animationRef = useRef<number | undefined>();
    const [reducedMotion, setReducedMotion] = useState(false);

    // Memoized calculations
    const radius = useMemo(() => (size - thickness) / 2, [size, thickness]);
    const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
    const center = useMemo(() => size / 2, [size]);
    
    const targetProgress = useMemo(() => {
      if (max <= 0) return 0;
      // Inverted: progress represents remaining credits (starts at 1, ends at 0)
      const progress = currentValue / max;
      return clamp ? Math.max(0, Math.min(1, progress)) : progress;
    }, [currentValue, max, clamp]);

    const fontSize = useMemo(() => {
      // Dynamic font sizing based on number length
      const numString = currentValue.toString();
      if (numString.length > 4) {
        return Math.max(8, Math.min(size * 0.25, 16));
      } else if (numString.length > 3) {
        return Math.max(9, Math.min(size * 0.3, 20));
      } else if (numString.length > 2) {
        return Math.max(10, Math.min(size * 0.35, 24));
      }
      return Math.max(10, Math.min(size * 0.45, 28));
    }, [size, currentValue]);

    // Check for reduced motion preference
    useEffect(() => {
      const checkReducedMotion = async () => {
        if (Platform.OS === 'web') {
          const mediaQuery = (window as any).matchMedia?.('(prefers-reduced-motion: reduce)');
          setReducedMotion(mediaQuery?.matches || false);
        } else {
          try {
            const isEnabled = await AccessibilityInfo.isReduceMotionEnabled?.() || false;
            setReducedMotion(isEnabled);
          } catch {
            setReducedMotion(false);
          }
        }
      };
      checkReducedMotion();
    }, []);

    // Animation function
    const animateToTarget = useCallback((targetValue: number, targetProgress: number) => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Update number immediately, animate only the ring
      setDisplayValue(targetValue);

      if (!animate || reducedMotion) {
        setAnimatedProgress(targetProgress);
        return;
      }

      const startTime = Date.now();
      const duration = 380;
      const startProgress = animatedProgress;

      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOut(progress);

        const currentProgress = startProgress + (targetProgress - startProgress) * easedProgress;
        setAnimatedProgress(currentProgress);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(tick) as any;
        }
      };

      animationRef.current = requestAnimationFrame(tick) as any;
    }, [animate, reducedMotion, animatedProgress]);

    // React to value changes
    useEffect(() => {
      animateToTarget(currentValue, targetProgress);
    }, [currentValue, targetProgress, animateToTarget]);

    // Cleanup animation on unmount
    useEffect(() => {
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, []);

    // Imperative API
    useImperativeHandle(ref, () => ({
      decrement: (step = 1) => {
        if (isControlled) {
          const newValue = Math.max(0, controlledValue - step);
          onChange?.(newValue);
          if (newValue === 0 && controlledValue > 0) {
            onExhausted?.();
          }
        } else {
          uncontrolledState.decrement(step);
        }
      },
      increment: (step = 1) => {
        if (isControlled) {
          const newValue = controlledValue + step;
          onChange?.(newValue);
        } else {
          uncontrolledState.increment(step);
        }
      },
      reset: (to) => {
        const resetValue = to ?? max;
        if (isControlled) {
          onChange?.(resetValue);
        } else {
          uncontrolledState.reset(resetValue);
        }
      },
      getValue: () => currentValue
    }), [isControlled, controlledValue, max, onChange, onExhausted, uncontrolledState]);

    // Accessibility
    const accessibilityLabel = ariaLabel || `${label}: ${currentValue} of ${max} remaining`;
    // Inverted: strokeDashoffset starts at 0 (full circle) and increases as credits decrease
    const strokeDashoffset = circumference * (1 - animatedProgress);

    // Web-specific accessibility
    const webProps = Platform.OS === 'web' ? {
      role: 'img' as any,
      'aria-label': accessibilityLabel,
      className
    } : {};

    return (
      <View style={styles.container} {...webProps}>
        {Platform.OS === 'web' && (
          <output 
            style={{ position: 'absolute', left: -10000, top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
            aria-valuenow={currentValue}
            aria-valuemax={max}
          >
            {currentValue}
          </output>
        )}
        
        <Text 
          style={[styles.label, { color: labelColor }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {label}
        </Text>

        <View style={[styles.ringContainer, { width: size, height: size }]}>
          <Svg width={size} height={size} style={styles.svg}>
            {/* Track circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={trackColor}
              strokeWidth={thickness}
              fill="none"
            />
            
            {/* Progress circle */}
            <G rotation="-90" origin={`${center}, ${center}`}>
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={progressColor}
                strokeWidth={thickness}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </G>
          </Svg>
          
          <View style={[styles.numberContainer, { width: size, height: size }]}>
            <Text 
              style={[
                styles.number, 
                { color: textColor, fontSize }
              ]}
              accessibilityRole={Platform.OS !== 'web' ? 'text' : undefined}
              accessibilityLabel={Platform.OS !== 'web' ? accessibilityLabel : undefined}
            >
              {displayValue}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 13,
    textAlign: 'center',
    marginRight: 12,
  },
  ringContainer: {
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  numberContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    fontWeight: '600',
    textAlign: 'center',
    ...(Platform.OS === 'web' && {
      letterSpacing: -0.5,
    }),
  },
});

CounterRing.displayName = 'CounterRing';

export default CounterRing;