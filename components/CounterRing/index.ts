/**
 * CounterRing - Production-quality React Native progress counter component
 * 
 * Re-exports for the CounterRing component system:
 * - CounterRing: Main component with SVG ring, animations, and accessibility
 * - useCreditsCounter: Hook for managing decrementing counter state
 * - Types: CounterRingProps, CounterRingHandle, CreditsCounterState
 * 
 * Install requirements:
 * npm i react-native-svg
 * npm i @react-native-async-storage/async-storage  # optional, for persistence
 */

export { default as CounterRing } from './CounterRing';
export type { CounterRingProps, CounterRingHandle } from './CounterRing';
export { useCreditsCounter } from './useCreditsCounter';
export type { UseCreditsCounterOptions, CreditsCounterState } from './useCreditsCounter';