import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './Button';
import { ImagePreview } from './ImagePreview';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { fonts } from '../constants/fonts';

export type InputMode = 'text' | 'screenshot';

interface InputSectionProps {
  onSubmit: (content: string, image?: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function InputSection({ onSubmit, loading, disabled = false }: InputSectionProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const [mode, setMode] = useState<InputMode>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleModeChange = async (newMode: InputMode) => {
    setMode(newMode);
    if (newMode === 'text') {
      setSelectedImage(null);
      // Auto-paste when switching to text mode
      const clipboardText = await Clipboard.getStringAsync();
      if (clipboardText && !textContent) {
        setTextContent(clipboardText);
      }
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setMode('screenshot');
    }
  };

  const handleSubmit = () => {
    if (mode === 'text' && textContent.trim()) {
      onSubmit(textContent.trim());
    } else if (mode === 'screenshot' && selectedImage) {
      onSubmit('', selectedImage);
    }
  };

  const isValid = mode === 'text' ? textContent.trim().length > 0 : selectedImage !== null;

  return (
    <View style={[styles.inputSectionContainer, { backgroundColor: colors.surface, paddingBottom: insets.bottom }]}>
      {/* Mode Toggle Buttons - Centered */}
      <View style={styles.inputModeToggleWrapper}>
        <View style={styles.inputModeToggleButtons}>
          <TouchableOpacity
            style={[
              styles.inputModeButton,
              mode === 'screenshot' && styles.inputModeButtonActive,
              { backgroundColor: mode === 'screenshot' ? colors.primary : colors.background },
              disabled && { opacity: 0.5 }
            ]}
            onPress={() => handleModeChange('screenshot')}
            activeOpacity={0.7}
            disabled={disabled}
          >
            <Ionicons 
              name="camera-outline" 
              size={18} 
              color={mode === 'screenshot' ? (colors.primary === colors.white ? colors.black : colors.white) : colors.text} 
            />
            <Text style={[
              styles.inputModeButtonText,
              { color: mode === 'screenshot' ? (colors.primary === colors.white ? colors.black : colors.white) : colors.text }
            ]}>
              Image
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.inputModeButton,
              mode === 'text' && styles.inputModeButtonActive,
              { backgroundColor: mode === 'text' ? colors.primary : colors.background },
              disabled && { opacity: 0.5 }
            ]}
            onPress={() => handleModeChange('text')}
            activeOpacity={0.7}
            disabled={disabled}
          >
            <Ionicons 
              name="document-text-outline" 
              size={18} 
              color={mode === 'text' ? (colors.primary === colors.white ? colors.black : colors.white) : colors.text} 
            />
            <Text style={[
              styles.inputModeButtonText,
              { color: mode === 'text' ? (colors.primary === colors.white ? colors.black : colors.white) : colors.text }
            ]}>
              Text
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Input Area */}
      {mode === 'text' ? (
        <View style={styles.textInputWrapper}>
          <TextInput
            style={[styles.textInputField, { color: colors.text }, disabled && { opacity: 0.5 }]}
            value={textContent}
            onChangeText={setTextContent}
            placeholder="Paste text or URL for instant analysis..."
            placeholderTextColor={colors.textSecondary}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            editable={!disabled}
          />
          <View style={styles.submitButtonContainer}>
            <Button
              variant={isValid && !loading ? "primary" : "secondary"}
              size="medium"
              icon="arrow-up"
              onPress={handleSubmit}
              disabled={!isValid || loading}
              loading={loading}
              style={styles.submitButton}
            />
          </View>
        </View>
      ) : (
        <View style={styles.imageUploadArea}>
          {selectedImage ? (
            <>
              <ImagePreview
                imageUri={selectedImage}
                onRemove={() => setSelectedImage(null)}
                onReplace={handleImagePick}
              />
              <Button
                variant="primary"
                size="medium"
                title={loading ? 'Analyzing...' : 'Analyze Screenshot'}
                onPress={handleSubmit}
                disabled={loading}
                loading={loading}
                fullWidth
                style={styles.analyzeImageButton}
              />
            </>
          ) : (
            <TouchableOpacity
              style={[styles.imageDropZone, { borderColor: colors.border }]}
              onPress={handleImagePick}
              activeOpacity={0.7}
            >
              <Ionicons name="cloud-upload-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.imageDropZoneTitle, { color: colors.textSecondary }]}>
                Upload a screenshot for analysis
              </Text>
              <Text style={[styles.imageDropZoneHint, { color: colors.textSecondary }]}>
                Click to browse or drag and drop
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
  inputSectionContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 0,
    height: 245, // Fixed height increased by 85px for bottom spacing
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputModeToggleWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  inputModeToggleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  inputModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 22,
    gap: 6,
    height: 44,
    minHeight: 44,
  },
  inputModeButtonActive: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  inputModeButtonText: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  textInputWrapper: {
    position: 'relative',
    height: 135, // Fixed height increased by 35px
    justifyContent: 'center',
  },
  textInputField: {
    backgroundColor: 'transparent',
    fontSize: 15,
    lineHeight: 20,
    paddingRight: 56,
    paddingLeft: 4,
    paddingVertical: 8,
    minHeight: 135,
    maxHeight: 235,
    textAlignVertical: 'top',
  },
  submitButtonContainer: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    width: 48,
  },
  submitButton: {
    width: 44,
    height: 44,
  },
  imageUploadArea: {
    height: 135, // Fixed height increased by 35px
    justifyContent: 'center',
  },
  imageDropZone: {
    height: 115, // Fixed height increased by 35px
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10, // Reduced padding to fit within fixed height
  },
  imageDropZoneTitle: {
    fontSize: 14,
    marginTop: 8,
    fontFamily: fonts.medium,
  },
  imageDropZoneHint: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  analyzeImageButton: {
    marginTop: 8,
  },
  });
}