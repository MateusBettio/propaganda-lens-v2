import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/theme-context';
import { ImagePreview } from './ImagePreview';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';

export type InputMode = 'text' | 'screenshot';

interface InputSectionProps {
  onSubmit: (content: string, image?: string) => void;
  loading?: boolean;
}

export function InputSection({ onSubmit, loading }: InputSectionProps) {
  const { colors } = useTheme();
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
    <View style={[styles.inputSectionContainer, { backgroundColor: colors.surface }]}>
      {/* Mode Toggle Buttons - Centered */}
      <View style={styles.inputModeToggleWrapper}>
        <View style={styles.inputModeToggleButtons}>
          <TouchableOpacity
            style={[
              styles.inputModeButton,
              mode === 'screenshot' && styles.inputModeButtonActive,
              { backgroundColor: mode === 'screenshot' ? colors.primary : colors.background }
            ]}
            onPress={() => handleModeChange('screenshot')}
            activeOpacity={0.7}
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
              Screenshot
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.inputModeButton,
              mode === 'text' && styles.inputModeButtonActive,
              { backgroundColor: mode === 'text' ? colors.primary : colors.background }
            ]}
            onPress={() => handleModeChange('text')}
            activeOpacity={0.7}
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
              Paste text
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Input Area */}
      {mode === 'text' ? (
        <View style={styles.textInputWrapper}>
          <TextInput
            style={[styles.textInputField, { color: colors.text }]}
            value={textContent}
            onChangeText={setTextContent}
            placeholder="Paste text or URL for instant analysis..."
            placeholderTextColor={colors.textSecondary}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
          <View style={styles.submitButtonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { 
                  backgroundColor: isValid && !loading ? colors.primary : colors.background,
                  borderColor: isValid && !loading ? colors.primary : colors.border,
                }
              ]}
              onPress={handleSubmit}
              disabled={!isValid || loading}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="arrow-up" 
                size={20} 
                color={isValid && !loading ? (colors.primary === colors.white ? colors.black : colors.white) : colors.textSecondary} 
              />
            </TouchableOpacity>
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
              <TouchableOpacity
                style={[
                  styles.analyzeImageButton,
                  { 
                    backgroundColor: !loading ? colors.primary : colors.background,
                  }
                ]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.analyzeImageButtonText}>
                  {loading ? 'Analyzing...' : 'Analyze Screenshot'}
                </Text>
              </TouchableOpacity>
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
    padding: 20,
    marginHorizontal: 0,
    minHeight: 200,
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
    fontWeight: '500',
  },
  textInputWrapper: {
    position: 'relative',
    minHeight: 140,
    justifyContent: 'center',
  },
  textInputField: {
    backgroundColor: 'transparent',
    fontSize: 15,
    lineHeight: 20,
    paddingRight: 56,
    paddingLeft: 4,
    paddingVertical: 8,
    minHeight: 100,
    maxHeight: 200,
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
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  imageUploadArea: {
    minHeight: 140,
    justifyContent: 'center',
  },
  imageDropZone: {
    minHeight: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  imageDropZoneTitle: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  imageDropZoneHint: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  analyzeImageButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 8,
    height: 44,
    minHeight: 44,
  },
  analyzeImageButtonText: {
    color: colors.primary === colors.white ? colors.black : colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  });
}