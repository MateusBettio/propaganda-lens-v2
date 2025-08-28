import React, { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const [bottomSectionVisible, setBottomSectionVisible] = useState(true);

  // Sheet starts at index 0 directly, no manual snapping needed

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // Hide bottom section immediately when sheet starts closing
      setBottomSectionVisible(false);
      onClose();
    } else {
      // Show bottom section when sheet is visible
      setBottomSectionVisible(true);
    }
  }, [onClose]);

  useEffect(() => {
    setBottomSectionVisible(open);
  }, [open]);

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
          isVisible={bottomSectionVisible}
        />
    </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handleIndicator: {
    backgroundColor: '#E5E7EB',
    width: 40,
    height: 4,
  },
  tabContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  placeholderContent: {
    flex: 1,
  },
});