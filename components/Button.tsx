import React, { useRef, useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  View, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator,
  AccessibilityInfo,
  AccessibilityRole,
  AccessibilityState
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/theme-context';
import { ColorScheme } from '../types';
import { fonts } from '../constants/fonts';

type IconName = keyof typeof Ionicons.glyphMap;

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  
  // Content options
  title?: string;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
  children?: React.ReactNode; // Fallback for custom content
  
  // Styling
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  
  // Accessibility - WCAG 2.2 AA compliant
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  // Minimum 44x44pt touch target (iOS) / 48x48dp (Android)
  minimumTouchTarget?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'medium',
  onPress, 
  disabled = false,
  loading = false,
  title,
  icon,
  iconPosition = 'left',
  iconSize,
  children,
  style,
  textStyle,
  fullWidth = false,
  testID,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  minimumTouchTarget = true
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const isDisabled = disabled || loading;
  const isIconOnly = !title && !children && icon;
  // Icon sizes optimized for circular buttons and proper visibility
  const getIconSize = () => {
    if (iconSize) return iconSize;
    if (isIconOnly) {
      // For circular icon-only buttons, use slightly larger icons for better visibility
      return size === 'small' ? 20 : size === 'large' ? 26 : 22;
    }
    // For buttons with text, use smaller icons to balance with text
    return size === 'small' ? 16 : size === 'large' ? 20 : 18;
  };
  
  const defaultIconSize = getIconSize();

  // Simplified and reliable color calculation
  const getAccessibleColors = () => {
    if (isDisabled) {
      return {
        textColor: colors.textSecondary,
        backgroundColor: colors.border,
        borderColor: colors.border
      };
    }
    
    switch (variant) {
      case 'primary':
        // Use high contrast colors for primary buttons
        // If primary is white, use black text; otherwise use white text
        return {
          textColor: colors.primary.toLowerCase() === '#ffffff' ? '#000000' : '#FFFFFF',
          backgroundColor: colors.primary,
          borderColor: colors.primary
        };
      case 'secondary':
        return {
          textColor: colors.text,
          backgroundColor: colors.surface,
          borderColor: colors.border
        };
      case 'outline':
        return {
          textColor: colors.primary,
          backgroundColor: 'transparent',
          borderColor: colors.primary
        };
      case 'ghost':
        return {
          textColor: colors.text,
          backgroundColor: 'transparent',
          borderColor: 'transparent'
        };
      default:
        return {
          textColor: colors.text,
          backgroundColor: colors.surface,
          borderColor: colors.border
        };
    }
  };

  const { textColor, backgroundColor, borderColor } = getAccessibleColors();

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={textColor} />
          {title && (
            <Text style={[styles.text, styles[`${size}Text`], { color: textColor, marginLeft: 8 }, textStyle]}>
              Loading...
            </Text>
          )}
        </View>
      );
    }

    if (children) {
      return children;
    }

    if (isIconOnly && icon) {
      return (
        <Ionicons 
          name={icon} 
          size={defaultIconSize} 
          color={textColor} 
        />
      );
    }

    const iconElement = icon ? (
      <Ionicons 
        name={icon} 
        size={defaultIconSize} 
        color={textColor} 
      />
    ) : null;

    const textElement = title ? (
      <Text style={[styles.text, styles[`${size}Text`], { color: textColor }, textStyle]}>
        {title}
      </Text>
    ) : null;

    if (icon && title) {
      return (
        <View style={styles.contentContainer}>
          {iconPosition === 'left' && iconElement}
          {textElement}
          {iconPosition === 'right' && iconElement}
        </View>
      );
    }

    return textElement || iconElement;
  };

  // Generate comprehensive accessibility label
  const getAccessibilityLabel = () => {
    if (accessibilityLabel) return accessibilityLabel;
    if (title) return title;
    if (isIconOnly && icon) {
      // Convert icon names to readable labels
      const iconLabels: Record<string, string> = {
        'arrow-up': 'Upload',
        'send': 'Send',
        'close': 'Close',
        'camera-outline': 'Camera',
        'document-text-outline': 'Text document',
        'sparkles': 'Sparkles',
        'shield-check': 'Shield check',
        'alert-octagon': 'Alert',
        'alert-triangle': 'Warning',
        'loader': 'Loading'
      };
      return iconLabels[icon] || `${icon} button`;
    }
    return 'Button';
  };

  const getAccessibilityHint = () => {
    if (accessibilityHint) return accessibilityHint;
    if (loading) return 'Loading, please wait';
    if (isDisabled) return 'Button is disabled';
    return 'Double tap to activate';
  };

  const getAccessibilityState = (): AccessibilityState => {
    return {
      disabled: isDisabled,
      busy: loading,
      ...accessibilityState
    };
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        styles[variant], 
        !isIconOnly && styles[size], // Only apply size styles to non-icon buttons
        isIconOnly && styles.iconOnly,
        isIconOnly && (
          size === 'small' ? styles.iconOnlySmall :
          size === 'large' ? styles.iconOnlyLarge : 
          styles.iconOnlyMedium
        ), // Apply size-specific icon styles
        fullWidth && styles.fullWidth,
        // Don't apply minimumTouchTarget for icon-only buttons as it conflicts
        !isIconOnly && minimumTouchTarget && styles.minimumTouchTarget,
        {
          backgroundColor: backgroundColor,
          borderColor: borderColor,
        },
        isDisabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
      // WCAG 2.2 AA Accessibility Properties
      accessible={true}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityHint={getAccessibilityHint()}
      accessibilityState={getAccessibilityState()}
      testID={testID}
      // Focus management
      importantForAccessibility="yes"
      accessibilityElementsHidden={false}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    button: {
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44, // WCAG 2.2 minimum touch target
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: 'transparent',
      // Focus indicator preparation
      borderStyle: 'solid',
    },
    
    // Variants - Colors handled dynamically for better contrast
    primary: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    secondary: {
      borderWidth: 1,
    },
    outline: {
      borderWidth: 1,
    },
    ghost: {},
    
    // Sizes - WCAG 2.2 AA compliant touch targets
    small: {
      height: 44, // Minimum 44pt touch target (was 36)
      paddingVertical: 10,
      paddingHorizontal: 16,
      minWidth: 44, // Ensure minimum width
    },
    medium: {
      height: 44,
      paddingVertical: 10,
      paddingHorizontal: 16,
      minWidth: 44,
    },
    large: {
      height: 48, // Slightly larger for better accessibility
      paddingVertical: 12,
      paddingHorizontal: 20,
      minWidth: 48,
    },
    
    // States
    disabled: {
      shadowOpacity: 0,
      elevation: 0,
      opacity: 0.6, // Clear visual indication of disabled state
    },
    
    // Layout - Base icon only style
    iconOnly: {
      justifyContent: 'center',
      alignItems: 'center',
      // Removed paddingHorizontal/paddingVertical: 0 to allow size-specific padding
    },
    
    // Size-specific circular buttons with proper padding for icon visibility
    iconOnlySmall: {
      width: 44,
      height: 44,
      borderRadius: 22,
      minWidth: 44,
      paddingHorizontal: 10, // Add padding to prevent icon cutoff
      paddingVertical: 10,
    },
    iconOnlyMedium: {
      width: 44,
      height: 44,
      borderRadius: 22,
      minWidth: 44,
      paddingHorizontal: 11, // Add padding to prevent icon cutoff
      paddingVertical: 11,
    },
    iconOnlyLarge: {
      width: 48,
      height: 48,
      borderRadius: 24,
      minWidth: 48,
      paddingHorizontal: 12, // Add padding to prevent icon cutoff
      paddingVertical: 12,
    },
    fullWidth: {
      alignSelf: 'stretch',
    },
    
    // WCAG 2.2 minimum touch target enforcement
    minimumTouchTarget: {
      minHeight: 44,
      minWidth: 44,
      // Add padding if content is smaller to ensure touch target
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    
    // Content
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    text: {
      fontFamily: fonts.semiBold,
      textAlign: 'center',
    },
    
    // Size-specific text with better readability
    smallText: {
      fontSize: 14,
      lineHeight: 20, // Improved readability
    },
    mediumText: {
      fontSize: 16,
      lineHeight: 22,
    },
    largeText: {
      fontSize: 18,
      lineHeight: 24,
    },
  });
}