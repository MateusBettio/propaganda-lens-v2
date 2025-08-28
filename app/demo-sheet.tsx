import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Switch,
} from 'react-native';
import { ContentAnalysisSheet, Variant, DetailType } from '../components/ContentAnalysisSheet';
import { Button } from '../components/Button';

const DEMO_IMAGE = 'https://picsum.photos/200/200';
const DEMO_TITLE = 'Breaking: Major Policy Change Announced';
const DEMO_DESCRIPTION = 'Government officials confirm sweeping reforms to be implemented nationwide starting next month. The changes will affect millions of citizens across multiple sectors.';
const LONG_DESCRIPTION = 'This is a very long description that tests the scrolling capabilities of the component. ' +
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' +
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

export default function DemoSheetScreen() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [variant, setVariant] = useState<Variant>('loading');
  const [detailType, setDetailType] = useState<DetailType>('image');
  const [confidence, setConfidence] = useState(0.85);
  const [useLongText, setUseLongText] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleVariantChange = useCallback((newVariant: Variant) => {
    setVariant(newVariant);
    if (newVariant === 'loading') {
      setTimeout(() => {
        setVariant('safe');
      }, 3000);
    }
  }, []);

  const handleSubmit = useCallback((value: string) => {
    console.log('Submitted:', value);
    setInputValue('');
    setVariant('loading');
    setTimeout(() => {
      setVariant('safe');
    }, 2000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>ContentAnalysisSheet Demo</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sheet Control</Text>
          <Button
            variant={sheetOpen ? "secondary" : "primary"}
            size="medium"
            title={sheetOpen ? 'Close Sheet' : 'Open Sheet'}
            onPress={() => setSheetOpen(!sheetOpen)}
            fullWidth
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Variant Selection</Text>
          <View style={styles.variantGrid}>
            {(['loading', 'deceptive', 'safe', 'satire', 'error'] as Variant[]).map((v) => (
              <Pressable
                key={v}
                style={[
                  styles.variantButton,
                  variant === v && styles.variantButtonActive,
                ]}
                onPress={() => handleVariantChange(v)}
              >
                <Text style={styles.variantButtonText}>{v}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Type</Text>
          <View style={styles.toggleRow}>
            <Pressable
              style={[
                styles.toggleButton,
                detailType === 'image' && styles.toggleButtonActive,
              ]}
              onPress={() => setDetailType('image')}
            >
              <Text style={styles.toggleButtonText}>Image</Text>
            </Pressable>
            <Pressable
              style={[
                styles.toggleButton,
                detailType === 'text' && styles.toggleButtonActive,
              ]}
              onPress={() => setDetailType('text')}
            >
              <Text style={styles.toggleButtonText}>Text Only</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options</Text>
          <View style={styles.option}>
            <Text style={styles.optionLabel}>Use Long Text</Text>
            <Switch
              value={useLongText}
              onValueChange={setUseLongText}
            />
          </View>
          <View style={styles.option}>
            <Text style={styles.optionLabel}>Confidence: {Math.round(confidence * 100)}%</Text>
            <Pressable
              style={styles.smallButton}
              onPress={() => setConfidence(Math.random())}
            >
              <Text style={styles.smallButtonText}>Random</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Scenarios</Text>
          <View style={styles.scenarioGrid}>
            <Button
              variant="outline"
              size="medium"
              title="Loading → Deceptive"
              onPress={() => {
                setVariant('loading');
                setSheetOpen(true);
                setTimeout(() => setVariant('deceptive'), 2000);
              }}
              fullWidth
            />
            <Button
              variant="outline"
              size="medium"
              title="Loading → Safe (with image)"
              onPress={() => {
                setVariant('loading');
                setDetailType('image');
                setSheetOpen(true);
                setTimeout(() => setVariant('safe'), 2000);
              }}
              fullWidth
            />
            <Button
              variant="outline"
              size="medium"
              title="Error State"
              onPress={() => {
                setVariant('error');
                setSheetOpen(true);
              }}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>

      <ContentAnalysisSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        source="inApp"
        detailType={detailType}
        variant={variant}
        imageUri={detailType === 'image' ? DEMO_IMAGE : undefined}
        title={DEMO_TITLE}
        description={useLongText ? LONG_DESCRIPTION : DEMO_DESCRIPTION}
        confidence={confidence}
        inputPlaceholder="Enter URL or text to analyze..."
        inputInitialValue={inputValue}
        onChangeInput={setInputValue}
        onSubmitInput={handleSubmit}
        submitLabel="Analyze"
        enableBackdropPressToClose={true}
        testID="demo-sheet"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  variantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  variantButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  variantButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#3B82F6',
  },
  toggleButtonText: {
    color: '#111827',
    fontWeight: '500',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionLabel: {
    fontSize: 14,
    color: '#374151',
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  smallButtonText: {
    fontSize: 12,
    color: '#374151',
  },
  scenarioGrid: {
    gap: 12,
  },
});