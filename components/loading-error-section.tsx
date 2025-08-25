import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { detectContentType } from '../utils/content-detector';
import { TwitterSkeleton, WebpageSkeleton } from './skeleton-loader';

interface LoadingErrorSectionProps {
  loading: boolean;
  error: string | null;
  inputContent: string;
  skeletonOpacity: Animated.Value;
}

export function LoadingErrorSection({ 
  loading, 
  error, 
  inputContent, 
  skeletonOpacity 
}: LoadingErrorSectionProps) {
  const { colors } = useTheme();

  return (
    <>
      {loading && (
        <Animated.View style={{ opacity: skeletonOpacity }}>
          {(() => {
            const contentType = detectContentType(inputContent.trim());
            return contentType === 'twitter' ? <TwitterSkeleton /> : <WebpageSkeleton />;
          })()}
        </Animated.View>
      )}
      
      {error && (
        <View style={[styles.errorBox, { backgroundColor: colors.error + '15', borderLeftColor: colors.error }]}>
          <Text style={[styles.errorHeading, { color: colors.error }]}>
            Analysis could not be completed
          </Text>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  errorHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
});