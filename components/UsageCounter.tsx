import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { fonts } from '../constants/fonts';

interface UsageCounterProps {
  remainingChecks: number;
  maxChecks: number;
}

export function UsageCounter({ remainingChecks, maxChecks }: UsageCounterProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const usagePercentage = ((maxChecks - remainingChecks) / maxChecks) * 100;
  const isLowUsage = remainingChecks <= 2;
  const strokeDasharray = 2 * Math.PI * 14;
  const strokeDashoffset = strokeDasharray * (usagePercentage / 100);

  return (
    <View style={styles.usageCounterContainer}>
      <View style={styles.usageCounterContent}>
        <Text style={[styles.freeAnalysisLabel, { color: colors.textSecondary }]}>
          Free{'\n'}Analysis
        </Text>
        
        <View style={styles.circularCounterContainer}>
          <View style={[
            styles.circularCounter,
            { 
              borderColor: colors.border,
              backgroundColor: colors.background,
            }
          ]}>
            <View style={[
              styles.circularProgressOverlay,
              { 
                borderColor: isLowUsage ? colors.error : colors.primary,
                borderTopColor: 'transparent',
                borderRightColor: usagePercentage < 25 ? 'transparent' : (isLowUsage ? colors.error : colors.primary),
                borderBottomColor: usagePercentage < 50 ? 'transparent' : (isLowUsage ? colors.error : colors.primary),
                borderLeftColor: usagePercentage < 75 ? 'transparent' : (isLowUsage ? colors.error : colors.primary),
                transform: [{ rotate: `${(usagePercentage / 100) * 360}deg` }],
              }
            ]} />
            <Text style={[
              styles.counterNumber,
              { color: isLowUsage ? colors.error : colors.text }
            ]}>
              {remainingChecks}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    usageCounterContainer: {
      alignItems: 'center',
    },
    usageCounterContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    freeAnalysisLabel: {
      fontSize: 11,
      fontFamily: fonts.medium,
      lineHeight: 13,
      textAlign: 'center',
    },
    circularCounterContainer: {
      position: 'relative',
    },
    circularCounter: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    circularProgressOverlay: {
      position: 'absolute',
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      top: -2,
      left: -2,
    },
    counterNumber: {
      fontSize: 14,
      fontFamily: fonts.bold,
      textAlign: 'center',
      zIndex: 1,
    },
  });
}