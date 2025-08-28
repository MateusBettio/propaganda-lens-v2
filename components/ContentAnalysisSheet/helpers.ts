import { useState, useCallback } from 'react';
import type { ContentAnalysisSheetProps, Variant, Technique } from './types';

interface UseContentAnalysisSheetReturn {
  sheetProps: ContentAnalysisSheetProps;
  open: () => void;
  close: () => void;
  setVariant: (variant: Variant) => void;
  setContent: (content: { 
    title?: string; 
    description?: string; 
    imageUri?: string;
    confidence?: number;
    techniques?: Technique[];
    quickAssessment?: string;
    counterPerspective?: string;
    reflectionQuestions?: string[];
  }) => void;
  setAnalysisData: (data: {
    techniques?: Technique[];
    quickAssessment?: string;
    counterPerspective?: string;
    reflectionQuestions?: string[];
  }) => void;
  analyze: (url: string) => Promise<void>;
}

export const useContentAnalysisSheet = (
  defaultProps?: Partial<ContentAnalysisSheetProps>
): UseContentAnalysisSheetReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [variant, setVariant] = useState<Variant>('loading');
  const [content, setContent] = useState({
    title: '',
    description: '',
    imageUri: '',
    confidence: 0,
    techniques: [] as Technique[],
    quickAssessment: '',
    counterPerspective: '',
    reflectionQuestions: [] as string[],
  });

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const analyze = useCallback(async (url: string) => {
    setVariant('loading');
    open();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = ['safe', 'deceptive', 'satire'] as Variant[];
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      
      setVariant(randomResult);
      setContent({
        title: 'Analysis Complete',
        description: `The content at ${url} has been analyzed.`,
        imageUri: '',
        confidence: 0.75 + Math.random() * 0.25,
      });
    } catch (error) {
      setVariant('error');
      setContent({
        title: 'Analysis Failed',
        description: 'Unable to analyze the content. Please try again.',
        imageUri: '',
        confidence: 0,
      });
    }
  }, [open]);

  const sheetProps: ContentAnalysisSheetProps = {
    open: isOpen,
    onClose: close,
    variant,
    detailType: defaultProps?.detailType || 'text',
    ...content,
    ...defaultProps,
  };

  return {
    sheetProps,
    open,
    close,
    setVariant,
    setContent: (newContent) => setContent(prev => ({ ...prev, ...newContent })),
    setAnalysisData: (data) => setContent(prev => ({ ...prev, ...data })),
    analyze,
  };
};

interface ShareIntentData {
  url?: string;
  text?: string;
  title?: string;
  type?: 'url' | 'text' | 'image';
  imageUri?: string;
}

export const handleShareIntent = async (
  data: ShareIntentData,
  onAnalyze: (content: string) => Promise<void>
): Promise<void> => {
  if (data.url) {
    await onAnalyze(data.url);
  } else if (data.text) {
    await onAnalyze(data.text);
  }
};

export const createShareHandler = (
  openSheet: () => void,
  setContent: (content: any) => void,
  analyze: (content: string) => Promise<void>
) => {
  return async (data: ShareIntentData) => {
    openSheet();
    
    if (data.title || data.text) {
      setContent({
        title: data.title || 'Shared Content',
        description: data.text || data.url || '',
        imageUri: data.imageUri,
      });
    }
    
    if (data.url || data.text) {
      await analyze(data.url || data.text || '');
    }
  };
};