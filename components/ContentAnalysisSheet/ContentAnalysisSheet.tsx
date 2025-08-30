import React, { useRef, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useAnimatedStyle, 
  interpolate,
  useSharedValue 
} from 'react-native-reanimated';
import { CustomBackdrop } from './CustomBackdrop';
import { Header } from './Header';
import { AnalysisBodyPlaceholder } from './AnalysisBodyPlaceholder';
import { BottomSection } from './BottomSection';
import { TabsView } from './TabsView';
import type { ContentAnalysisSheetProps } from './types';

export const ContentAnalysisSheet: React.FC<ContentAnalysisSheetProps> = React.memo(({
  open,
  onClose,
  source = 'inApp',
  detailType,
  variant,
  imageUri,
  title,
  description,
  confidence,
  techniques,
  quickAssessment,
  counterPerspective,
  reflectionQuestions,
  inputPlaceholder,
  inputInitialValue,
  onChangeInput,
  onSubmitInput,
  submitLabel,
  snapPoints = ['75%', '90%'],
  enableBackdropPressToClose = true,
  testID,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  
  const initialSnapPoints = useMemo(() => snapPoints || ['75%', '90%'], [snapPoints]);
  const animatedIndex = useSharedValue(0);

  const handleSheetChanges = useCallback((index: number) => {
    animatedIndex.value = index;
    if (index === -1) {
      onClose();
    }
  }, [onClose, animatedIndex]);

  // Animate bottom section with the modal position
  const bottomSectionAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      animatedIndex.value,
      [-1, 0], // From closed to first snap point
      [100, 0], // Slide down when closed, normal position when open
      'clamp'
    );
    
    return {
      transform: [{ translateY }],
    };
  });

  const renderBackdrop = useCallback(
    (props: any) => (
      <CustomBackdrop
        {...props}
        enableBackdropPressToClose={enableBackdropPressToClose}
        onClose={onClose}
      />
    ),
    [enableBackdropPressToClose, onClose]
  );

  if (!open) {
    return null;
  }

  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFillObject}>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={initialSnapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        animateOnMount
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        activeOffsetY={[-5, 5]}
        failOffsetX={[-10, 10]}
      >
          <View style={{ flex: 1, paddingBottom: 80 }}>
            <Header
              variant={variant}
              confidence={confidence}
            />
            
            <TabsView
              tabs={[
                { id: 'analysis', label: 'Analysis' },
                { id: 'counter', label: 'Counter Arguments' },
                { id: 'remove', label: 'Remove Propaganda' },
                { id: 'fact-check', label: 'Fact Check' },
                { id: 'sources', label: 'Sources' },
                { id: 'context', label: 'Context' },
                { id: 'summary', label: 'Summary' },
              ]}
            >
              {/* Analysis Tab */}
              <BottomSheetScrollView
                contentContainerStyle={styles.tabContentContainer}
                showsVerticalScrollIndicator={false}
              >
                <AnalysisBodyPlaceholder 
                  variant={variant} 
                  testContent={source === 'inApp'}
                  techniques={techniques}
                  quickAssessment={quickAssessment}
                  counterPerspective={counterPerspective}
                  reflectionQuestions={reflectionQuestions}
                />
              </BottomSheetScrollView>
              
              {/* Counter Arguments Tab */}
              <BottomSheetScrollView
                contentContainerStyle={styles.tabContentContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.placeholderContent}>
                  <AnalysisBodyPlaceholder 
                    variant={variant}
                    testContent={source === 'inApp'}
                    counterPerspective={counterPerspective}
                  />
                </View>
              </BottomSheetScrollView>
              
              {/* Remove Propaganda Tab */}
              <BottomSheetScrollView
                contentContainerStyle={styles.tabContentContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.placeholderContent}>
                  <AnalysisBodyPlaceholder 
                    variant={variant}
                    testContent={source === 'inApp'}
                  />
                </View>
              </BottomSheetScrollView>
              
              {/* Fact Check Tab */}
              <BottomSheetScrollView
                contentContainerStyle={styles.tabContentContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.placeholderContent}>
                  <AnalysisBodyPlaceholder 
                    variant={variant}
                    testContent={source === 'inApp'}
                  />
                </View>
              </BottomSheetScrollView>
              
              {/* Sources Tab */}
              <BottomSheetScrollView
                contentContainerStyle={styles.tabContentContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.placeholderContent}>
                  <AnalysisBodyPlaceholder 
                    variant={variant}
                    testContent={source === 'inApp'}
                  />
                </View>
              </BottomSheetScrollView>
              
              {/* Context Tab */}
              <BottomSheetScrollView
                contentContainerStyle={styles.tabContentContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.placeholderContent}>
                  <AnalysisBodyPlaceholder 
                    variant={variant}
                    testContent={source === 'inApp'}
                  />
                </View>
              </BottomSheetScrollView>
              
              {/* Summary Tab */}
              <BottomSheetScrollView
                contentContainerStyle={styles.tabContentContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.placeholderContent}>
                  <AnalysisBodyPlaceholder 
                    variant={variant}
                    testContent={source === 'inApp'}
                  />
                </View>
              </BottomSheetScrollView>
            </TabsView>
          </View>
        </BottomSheet>
        
        <BottomSection
          placeholder={inputPlaceholder}
          onSubmit={onSubmitInput}
          animatedStyle={bottomSectionAnimatedStyle}
        />
    </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#E5E7EB',
    width: 40,
    height: 4,
  },
  tabContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 8,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  placeholderContent: {
    flex: 1,
  },
});