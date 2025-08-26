/**
 * useCreditsCounter - Hook for managing decrementing counter state
 * 
 * Provides state management for a counter that starts at an initial value and decrements
 * with guardrails (never below min). Supports optional persistence via AsyncStorage.
 * 
 * Math: value decrements from initial down to min (default 0), with onExhausted firing
 * exactly once when reaching the minimum.
 * 
 * Persistence: If persistenceKey provided, loads initial state on mount and saves
 * changes debounced. Gracefully handles AsyncStorage unavailability.
 * 
 * Returns: { value, decrement, increment, reset } for managing counter state
 * 
 * Example:
 * const credits = useCreditsCounter(10, {
 *   min: 0,
 *   max: 10,
 *   onChange: (n) => console.log('Credits:', n),
 *   onExhausted: () => alert('No credits left!'),
 *   persistenceKey: 'user_credits'
 * });
 */

import { useState, useEffect, useCallback, useRef } from 'react';

let AsyncStorage: any = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // AsyncStorage not available, persistence will be no-op
}

export type UseCreditsCounterOptions = {
  /** Minimum value (default 0) */
  min?: number;
  /** Maximum value (default initial) */
  max?: number;
  /** Called on every value change */
  onChange?(value: number): void;
  /** Called exactly once when reaching minimum */
  onExhausted?(): void;
  /** AsyncStorage key for persistence */
  persistenceKey?: string;
};

export type CreditsCounterState = {
  value: number;
  decrement(step?: number): void;
  increment(step?: number): void;
  reset(to?: number): void;
};

export function useCreditsCounter(
  initial = 10,
  options: UseCreditsCounterOptions = {}
): CreditsCounterState {
  const {
    min = 0,
    max = initial,
    onChange,
    onExhausted,
    persistenceKey
  } = options;

  const [value, setValue] = useState(initial);
  const [isLoaded, setIsLoaded] = useState(!persistenceKey);
  const hasCalledExhausted = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>();

  // Load persisted value on mount
  useEffect(() => {
    if (!persistenceKey || !AsyncStorage) {
      setIsLoaded(true);
      return;
    }

    const loadValue = async () => {
      try {
        const saved = await AsyncStorage.getItem(persistenceKey);
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed)) {
            setValue(parsed);
            // Reset exhausted flag if loading a value > min
            if (parsed > min) {
              hasCalledExhausted.current = false;
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load credits from storage:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadValue();
  }, [persistenceKey, min]);

  // Persist value changes (debounced)
  useEffect(() => {
    if (!isLoaded || !persistenceKey || !AsyncStorage) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(persistenceKey, value.toString());
      } catch (error) {
        console.warn('Failed to save credits to storage:', error);
      }
    }) as any;

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [value, isLoaded, persistenceKey]);

  // Handle value changes and callbacks
  useEffect(() => {
    if (!isLoaded) return;

    onChange?.(value);

    // Fire onExhausted exactly once when reaching minimum
    if (value <= min && !hasCalledExhausted.current) {
      hasCalledExhausted.current = true;
      onExhausted?.();
    } else if (value > min) {
      hasCalledExhausted.current = false;
    }
  }, [value, isLoaded, min, onChange, onExhausted]);

  const decrement = useCallback((step = 1) => {
    setValue(prev => {
      const next = prev - step;
      return Math.max(min, next);
    });
  }, [min]);

  const increment = useCallback((step = 1) => {
    setValue(prev => {
      const next = prev + step;
      return Math.min(max, next);
    });
  }, [max]);

  const reset = useCallback((to?: number) => {
    const resetValue = to ?? max;
    setValue(Math.max(min, Math.min(max, resetValue)));
  }, [min, max]);

  return {
    value,
    decrement,
    increment,
    reset
  };
}