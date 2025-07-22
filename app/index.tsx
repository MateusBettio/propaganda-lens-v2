import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { useState } from 'react';
import { useAnalysis } from '../hooks/use-analysis';
import { detectContentType } from '../utils/content-detector';

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Propaganda Lens V2</Text>
      <Text style={styles.subtitle}>Enter a URL to analyze</Text>
      
      <TextInput
        style={[
          styles.textInput,
          validationError ? styles.textInputError : null
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
        <View style={styles.validationBox}>
          <Text style={styles.validationText}>{validationError}</Text>
        </View>
      ) : null}
      
      <TouchableOpacity 
        style={[styles.analyzeButton, (!isInputValid || loading) && styles.analyzeButtonDisabled]}
        onPress={handleAnalyze}
        disabled={loading || !isInputValid}
      >
        <Text style={[styles.analyzeButtonText, (!isInputValid || loading) && styles.analyzeButtonTextDisabled]}>
          {loading ? "Analyzing..." : "Analyze Content"}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={styles.loader} />}
      
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {result && (
        <View style={styles.resultsContainer}>
          {/* Header Card */}
          <View style={styles.headerCard}>
            <Text style={styles.resultTitle}>Analysis Complete</Text>
            {result.sourceInfo && (
              <Text style={styles.sourceText}>Source: {new URL(result.sourceInfo.sourceUrl).hostname}</Text>
            )}
          </View>

          {/* Score Card */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreLabel}>Manipulation Risk</Text>
              <View style={[
                styles.scoreBadge,
                result.manipulationScore <= 3 ? styles.scoreLow :
                result.manipulationScore <= 6 ? styles.scoreMedium : styles.scoreHigh
              ]}>
                <Text style={styles.scoreNumber}>{result.manipulationScore}</Text>
                <Text style={styles.scoreMax}>/10</Text>
              </View>
            </View>
            <View style={[
              styles.scoreBar,
              result.manipulationScore <= 3 ? styles.scoreBarLow :
              result.manipulationScore <= 6 ? styles.scoreBarMedium : styles.scoreBarHigh
            ]}>
              <View 
                style={[
                  styles.scoreProgress,
                  { width: `${(result.manipulationScore / 10) * 100}%` },
                  result.manipulationScore <= 3 ? styles.scoreProgressLow :
                  result.manipulationScore <= 6 ? styles.scoreProgressMedium : styles.scoreProgressHigh
                ]}
              />
            </View>
          </View>

          {/* Assessment Card */}
          <View style={styles.assessmentCard}>
            <Text style={styles.cardTitle}>Quick Assessment</Text>
            <Text style={styles.assessmentText}>{result.quickAssessment}</Text>
          </View>
          
          {/* Techniques Card */}
          {result.techniques && result.techniques.length > 0 && (
            <View style={styles.techniquesCard}>
              <Text style={styles.cardTitle}>Propaganda Techniques Detected ({result.techniques.length})</Text>
              {result.techniques.map((technique, index) => (
                <Pressable key={index} style={styles.techniqueItem}>
                  <View style={styles.techniqueHeader}>
                    <Text style={styles.techniqueName}>{technique.name}</Text>
                    <View style={[
                      styles.confidenceBadge,
                      technique.confidence === 'high' ? styles.confidenceHigh :
                      technique.confidence === 'medium' ? styles.confidenceMedium : styles.confidenceLow
                    ]}>
                      <Text style={styles.confidenceText}>{technique.confidence}</Text>
                    </View>
                  </View>
                  <Text style={styles.techniqueDescription}>{technique.description}</Text>
                  {technique.example && (
                    <View style={styles.exampleContainer}>
                      <Text style={styles.exampleLabel}>Example:</Text>
                      <Text style={styles.exampleText}>"{technique.example}"</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {/* Counter Perspective Card */}
          {result.counterPerspective && (
            <View style={styles.counterCard}>
              <Text style={styles.cardTitle}>Alternative Perspective</Text>
              <Text style={styles.counterText}>{result.counterPerspective}</Text>
            </View>
          )}

          {/* Questions Card */}
          {result.reflectionQuestions && result.reflectionQuestions.length > 0 && (
            <View style={styles.questionsCard}>
              <Text style={styles.cardTitle}>Critical Thinking Questions</Text>
              {result.reflectionQuestions.map((question, index) => (
                <View key={index} style={styles.questionItem}>
                  <Text style={styles.questionNumber}>{index + 1}.</Text>
                  <Text style={styles.questionText}>{question}</Text>
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
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
    textAlign: 'center',
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    backgroundColor: '#ffffff',
    marginBottom: 12,
    textAlignVertical: 'top',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  textInputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  validationBox: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    width: '100%',
  },
  validationText: {
    color: '#dc2626',
    fontSize: 14,
  },
  analyzeButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    marginBottom: 16,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0.1,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeButtonTextDisabled: {
    color: '#cbd5e1',
  },
  loader: {
    marginTop: 20,
    transform: [{ scale: 1.2 }],
  },
  errorBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    width: '100%',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    lineHeight: 20,
  },
  resultsContainer: {
    marginTop: 24,
    width: '100%',
    gap: 16,
  },
  headerCard: {
    backgroundColor: '#ffffff',
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
    color: '#1e293b',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  scoreCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreLow: { backgroundColor: '#d1fae5' },
  scoreMedium: { backgroundColor: '#fef3c7' },
  scoreHigh: { backgroundColor: '#fee2e2' },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 2,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  scoreBarLow: { backgroundColor: '#e5e7eb' },
  scoreBarMedium: { backgroundColor: '#e5e7eb' },
  scoreBarHigh: { backgroundColor: '#e5e7eb' },
  scoreProgressLow: { backgroundColor: '#10b981' },
  scoreProgressMedium: { backgroundColor: '#f59e0b' },
  scoreProgressHigh: { backgroundColor: '#ef4444' },
  assessmentCard: {
    backgroundColor: '#ffffff',
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
    color: '#374151',
    marginBottom: 12,
  },
  assessmentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  techniquesCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  techniqueItem: {
    backgroundColor: '#f8fafc',
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
    color: '#1e293b',
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
    color: '#4b5563',
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
    color: '#374151',
    lineHeight: 18,
  },
  counterCard: {
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  counterText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#166534',
  },
  questionsCard: {
    backgroundColor: '#fefce8',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#eab308',
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
    color: '#ca8a04',
    marginRight: 8,
    minWidth: 20,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#a16207',
    flex: 1,
  },
});