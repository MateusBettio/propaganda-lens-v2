import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { isValidURL } from './url-validation';

interface InputSectionProps {
  inputContent: string;
  onInputChange: (text: string) => void;
  onAnalyze: () => void;
  loading: boolean;
  validationError: string;
}

export function InputSection({ 
  inputContent, 
  onInputChange, 
  onAnalyze, 
  loading, 
  validationError 
}: InputSectionProps) {
  const { colors } = useTheme();
  const isInputValid = inputContent.trim() && isValidURL(inputContent.trim());

  return (
    <>
      <TextInput
        style={[
          styles.textInput,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          validationError ? { borderColor: colors.error } : null
        ]}
        multiline
        numberOfLines={3}
        placeholder="Paste a URL here for instant analysis..."
        placeholderTextColor={colors.textSecondary}
        value={inputContent}
        onChangeText={onInputChange}
        editable={!loading}
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      {validationError ? (
        <View style={[styles.validationBox, { backgroundColor: colors.error + '15', borderLeftColor: colors.error }]}>
          <Text style={[styles.validationText, { color: colors.error }]}>{validationError}</Text>
        </View>
      ) : null}
      
      <TouchableOpacity 
        style={[
          styles.analyzeButton, 
          { backgroundColor: colors.primary }, 
          (!isInputValid || loading) && { backgroundColor: colors.textSecondary }
        ]}
        onPress={onAnalyze}
        disabled={loading || !isInputValid}
      >
        <Text style={[styles.analyzeButtonText, (!isInputValid || loading) && { color: colors.background }]}>
          {loading ? "Analyzing..." : "Manual Analysis"}
        </Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  textInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  validationBox: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  validationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  analyzeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});