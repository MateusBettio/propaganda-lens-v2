import { AnalysisResult } from '../types';

const mockTechniques = [
  {
    name: 'Loaded Language',
    description: 'Uses emotionally charged words to influence perception',
    severity: 'medium' as const,
    examples: ['devastating', 'incredible', 'shocking'],
    explanation: 'The content uses emotionally charged words that may influence your perception of the topic.',
  },
  {
    name: 'Cherry Picking',
    description: 'Selectively presents facts that support one side',
    severity: 'high' as const,
    examples: ['Only mentioning positive outcomes', 'Ignoring contradictory evidence'],
    explanation: 'The content appears to selectively present information that supports a particular viewpoint.',
  },
  {
    name: 'Appeal to Authority',
    description: 'References authority figures to support claims',
    severity: 'low' as const,
    examples: ['Experts say', 'Studies show', 'Scientists agree'],
    explanation: 'The content relies on authority figures to validate claims without providing specific evidence.',
  },
];

const mockQuickAssessments = [
  'This content appears to use emotional language to influence your perception. Consider looking for more neutral sources.',
  'The article presents a one-sided view. Try to find alternative perspectives for a balanced understanding.',
  'This piece relies heavily on authority claims. Verify the specific sources and studies mentioned.',
  'The content seems balanced but watch for subtle bias in word choices and framing.',
];

const mockCounterPerspectives = [
  'Consider that there may be additional factors not mentioned in this content that could provide important context.',
  'Alternative viewpoints suggest that the situation is more nuanced than presented here.',
  'Other sources report different interpretations of the same events or data.',
  'Critics argue that important context has been omitted from this narrative.',
];

const mockReflectionQuestions = [
  ['What emotions does this content evoke?', 'Who benefits from this perspective?', 'What information might be missing?'],
  ['How would someone with an opposing view interpret this?', 'What evidence supports the main claims?', 'Are there unstated assumptions?'],
  ['What sources are cited and are they credible?', 'Does this align with other information you know?', 'What agenda might the author have?'],
];

export async function analyzeContent(content: string): Promise<AnalysisResult> {
  console.log('=== MOCK API CALL ===');
  console.log('Content:', content.substring(0, 100) + '...');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Randomly select mock data
  const numTechniques = Math.floor(Math.random() * 3) + 1;
  const selectedTechniques = [...mockTechniques]
    .sort(() => Math.random() - 0.5)
    .slice(0, numTechniques);

  const quickAssessment = mockQuickAssessments[Math.floor(Math.random() * mockQuickAssessments.length)];
  const counterPerspective = mockCounterPerspectives[Math.floor(Math.random() * mockCounterPerspectives.length)];
  const reflectionQuestions = mockReflectionQuestions[Math.floor(Math.random() * mockReflectionQuestions.length)];

  console.log('=== MOCK ANALYSIS SUCCESS ===');

  return {
    techniques: selectedTechniques,
    manipulationScore: 0,
    quickAssessment,
    counterPerspective,
    reflectionQuestions,
    sourceInfo: {
      sourceUrl: content.startsWith('http') ? content : undefined,
      contentType: 'text',
    },
    language: 'en',
    languageConfidence: 0.95,
  };
}