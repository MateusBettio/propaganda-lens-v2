import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, TextInput } from 'react-native';
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
      
      <Button 
        title={loading ? "Analyzing..." : "Analyze URL"}
        onPress={handleAnalyze}
        disabled={loading || !isInputValid}
      />

      {loading && <ActivityIndicator style={styles.loader} />}
      
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Analysis Result</Text>
          <Text style={styles.scoreText}>Manipulation Score: {result.manipulationScore}/5</Text>
          <Text style={styles.assessmentText}>{result.quickAssessment}</Text>
          
          {result.techniques && result.techniques.length > 0 && (
            <View style={styles.techniquesContainer}>
              <Text style={styles.sectionTitle}>Detected Techniques:</Text>
              {result.techniques.map((technique, index) => (
                <View key={index} style={styles.techniqueBox}>
                  <Text style={styles.techniqueName}>{technique.name}</Text>
                  <Text style={styles.techniqueDescription}>{technique.description}</Text>
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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    minHeight: 80,
    backgroundColor: '#fff',
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  textInputError: {
    borderColor: '#d32f2f',
    borderWidth: 2,
  },
  validationBox: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 6,
    width: '100%',
  },
  validationText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  errorBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    width: '100%',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  resultBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    width: '100%',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  assessmentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  techniquesContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  techniqueBox: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  techniqueName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  techniqueDescription: {
    fontSize: 12,
    color: '#666',
  },
});