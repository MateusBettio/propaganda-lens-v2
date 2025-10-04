/**
 * Constants for ContentAnalysisSheet
 */

// Animation constants
export const ANIMATION_CONFIG = {
  // Scroll animation
  SCROLL_DISTANCE: 120,
  HEADER_HEIGHT: 250,
  COMPACT_HEADER_HEIGHT: 60,

  // Tab transition
  TAB_TRANSITION_DURATION: 300,
  TAB_SLIDE_DISTANCE: 100,

  // Gesture thresholds - Optimized for better swipe detection
  SWIPE_THRESHOLD: 60,     // Increased from 30 for more deliberate swipes
  VELOCITY_THRESHOLD: 500,  // Increased from 300 for faster swipe detection
  MIN_DISTANCE: 15,         // Increased from 10 to reduce accidental triggers
  ACTIVE_OFFSET_X: 20,      // Increased from 10 for better activation zone
  FAIL_OFFSET_Y: 25,        // Slightly reduced to allow some diagonal movement
} as const;

// Layout constants
export const LAYOUT_CONFIG = {
  BOTTOM_SHEET_SNAP_POINTS: ['80%', '95%'] as const,
  CHAT_INPUT_BOTTOM_PADDING: 120,
  CHAT_CONTENT_BOTTOM_SPACING: 100,
  ANALYSIS_CONTENT_BOTTOM_PADDING: 280,
} as const;

// Color theme
export const THEME_COLORS = {
  default: '#1f2937',
  light: '#6b7280',
  background: '#ffffff',
  surface: '#f9fafb',
  border: '#e5e7eb',
} as const;