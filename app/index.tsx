import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Pressable, Image } from 'react-native';
import { useState } from 'react';
import { useAnalysis } from '../hooks/use-analysis';
import { detectContentType } from '../utils/content-detector';
import { useTheme } from '../contexts/theme-context';
import { ThemeSwitcher } from '../components/theme-switcher';

// URL validation function
function isValidURL(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function HomeScreen() {
  const [inputContent, setInputContent] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const { loading, error, result, analyze } = useAnalysis();
  const { colors } = useTheme();

  const handleInputChange = (text: string) => {
    setInputContent(text);
    setValidationError(''); // Clear validation error when user types
  };

  const handleAnalyze = async () => {
    const contentToAnalyze = inputContent.trim();
    
    // Validation: require URL
    if (!contentToAnalyze) {
      setValidationError('Please enter a URL to analyze');
      return;
    }
    
    if (!isValidURL(contentToAnalyze)) {
      setValidationError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }
    
    // Clear validation error if we get here
    setValidationError('');
    
    try {
      const contentType = detectContentType(contentToAnalyze);
      console.log('Analyzing URL:', contentToAnalyze);
      await analyze(contentToAnalyze, contentType);
    } catch (err) {
      console.error('Analysis error:', err);
    }
  };

  // Check if input is valid for button state
  const isInputValid = inputContent.trim() && isValidURL(inputContent.trim());

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Propaganda Lens V2</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Enter a URL to analyze</Text>
        </View>
        <ThemeSwitcher />
      </View>
      
      <TextInput
        style={[
          styles.textInput,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          validationError ? { borderColor: colors.error } : null
        ]}
        multiline
        numberOfLines={3}
        placeholder="Enter a URL (e.g., https://example.com/article)..."
        value={inputContent}
        onChangeText={handleInputChange}
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
        style={[styles.analyzeButton, { backgroundColor: colors.primary }, (!isInputValid || loading) && { backgroundColor: colors.textSecondary }]}
        onPress={handleAnalyze}
        disabled={loading || !isInputValid}
      >
        <Text style={[styles.analyzeButtonText, (!isInputValid || loading) && { color: colors.background }]}>
          {loading ? "Analyzing..." : "Analyze Content"}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={styles.loader} />}
      
      {error && (
        <View style={[styles.errorBox, { backgroundColor: colors.error + '15', borderLeftColor: colors.error }]}>
          <Text style={[styles.errorHeading, { color: colors.error }]}>Analysis could not be completed</Text>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}
      
      {result && !error && (
        <View style={styles.resultsContainer}>
          {/* Header Card */}
          <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.resultTitle, { color: colors.text }]}>Analysis Complete</Text>
            {result.sourceInfo && (
              <View style={styles.sourceContainer}>
                {result.sourceInfo.extractedData?.thumbnail && (
                  <Image source={{ uri: result.sourceInfo.extractedData.thumbnail }} style={styles.thumbnail} />
                )}
                <View style={styles.sourceTextContainer}>
                  <Text style={[styles.sourceText, { color: colors.textSecondary }]}>Source: {new URL(result.sourceInfo.sourceUrl).hostname}</Text>
                  {result.sourceInfo.extractedData?.title && (
                    <Text style={[styles.sourceTitle, { color: colors.text }]} numberOfLines={2}>{result.sourceInfo.extractedData.title}</Text>
                  )}
                </View>
              </View>
            )}
          </View>


          {/* Assessment Card */}
          <View style={[styles.assessmentCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Quick Assessment</Text>
            <Text style={[styles.assessmentText, { color: colors.textSecondary }]}>{result.quickAssessment}</Text>
          </View>
          
          {/* Techniques Card */}
          {result.techniques && result.techniques.length > 0 && (
            <View style={[styles.techniquesCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Propaganda Techniques Detected ({result.techniques.length})</Text>
              {result.techniques.map((technique, index) => {
                console.log(`Technique ${index}:`, JSON.stringify(technique, null, 2));
                return (
                  <Pressable key={index} style={[styles.techniqueItem, { backgroundColor: colors.surface }]}>
                    <View style={styles.techniqueHeader}>
                      <Text style={[styles.techniqueName, { color: colors.text }]}>{technique.name}</Text>
                      <View style={[
                        styles.confidenceBadge,
                        technique.confidence === 'high' ? styles.confidenceHigh :
                        technique.confidence === 'medium' ? styles.confidenceMedium : styles.confidenceLow
                      ]}>
                        <Text style={styles.confidenceText}>{technique.confidence}</Text>
                      </View>
                    </View>
                    <Text style={[styles.techniqueDescription, { color: colors.textSecondary }]}>{technique.description}</Text>
                    {technique.example && technique.example.trim() && (
                      <View style={styles.exampleContainer}>
                        <Text style={styles.exampleLabel}>Example:</Text>
                        <Text style={[styles.exampleText, { color: colors.text }]}>"{technique.example}"</Text>
                      </View>
                    )}
                    {/* Debug info */}
                    {__DEV__ && (
                      <Text style={{ fontSize: 10, color: 'red' }}>
                        Example: {technique.example ? `"${technique.example}"` : 'null/undefined'}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Counter Perspective Card */}
          {result.counterPerspective && (
            <View style={[styles.counterCard, { backgroundColor: colors.success + '15', borderLeftColor: colors.success }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Alternative Perspective</Text>
              <Text style={[styles.counterText, { color: colors.textSecondary }]}>{result.counterPerspective}</Text>
            </View>
          )}

          {/* Questions Card */}
          {result.reflectionQuestions && result.reflectionQuestions.length > 0 && (
            <View style={[styles.questionsCard, { backgroundColor: colors.warning + '15', borderLeftColor: colors.warning }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Critical Thinking Questions</Text>
              {result.reflectionQuestions.map((question, index) => (
                <View key={index} style={styles.questionItem}>
                  <Text style={[styles.questionNumber, { color: colors.warning }]}>{index + 1}.</Text>
                  <Text style={[styles.questionText, { color: colors.textSecondary }]}>{question}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: 'top',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  validationBox: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    width: '100%',
  },
  validationText: {
    fontSize: 14,
  },
  analyzeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    marginBottom: 16,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginTop: 20,
    transform: [{ scale: 1.2 }],
  },
  errorBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    width: '100%',
  },
  errorHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resultsContainer: {
    marginTop: 24,
    width: '100%',
    gap: 16,
  },
  headerCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  sourceTextContainer: {
    flex: 1,
  },
  sourceText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  assessmentCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  assessmentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  techniquesCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  techniqueItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  techniqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  techniqueName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  confidenceHigh: { backgroundColor: '#dcfce7' },
  confidenceMedium: { backgroundColor: '#fef3c7' },
  confidenceLow: { backgroundColor: '#fee2e2' },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  techniqueDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  exampleContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e7eb',
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  exampleText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  counterCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  counterText: {
    fontSize: 16,
    lineHeight: 24,
  },
  questionsCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    minWidth: 20,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
});