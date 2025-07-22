import { AnalysisResult } from '../types';

export async function mockAnalyzeContent(content: string): Promise<AnalysisResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    techniques: [
      {
        name: "Emotional Appeal",
        description: "Uses strong emotional language to influence",
        confidence: "high",
        example: "This is a test analysis"
      }
    ],
    manipulationScore: 3,
    quickAssessment: "This is a test analysis result. In production, this will analyze real content.",
    counterPerspective: "Consider alternative viewpoints...",
    reflectionQuestions: [
      "What facts support this claim?",
      "Who benefits from this narrative?",
      "What's missing from this story?"
    ]
  };
}