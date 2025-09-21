export type Variant = 'loading' | 'deceptive' | 'safe' | 'satire' | 'error';
export type DetailType = 'image' | 'text';
export type Source = 'share' | 'inApp';

export interface Technique {
  name: string;
  description: string;
  confidence: 'low' | 'medium' | 'high';
  example: string;
}

export interface SourceInfo {
  title: string;
  url: string;
  domain: string;
  thumbnail?: string;
}

export interface ContentAnalysisSheetProps {
  open: boolean;
  onClose: () => void;

  source?: Source;
  detailType: DetailType;

  variant: Variant;
  imageUri?: string;
  title?: string;
  description?: string;
  confidence?: number;
  techniques?: Technique[];
  quickAssessment?: string;
  counterPerspective?: string;
  reflectionQuestions?: string[];

  // Shared Content props
  sharedContent?: string;
  sharedContentType?: 'url' | 'text' | 'audio' | 'trending';
  sources?: SourceInfo[];
  isTrendingAnalysis?: boolean;

  inputPlaceholder?: string;
  inputInitialValue?: string;
  onChangeInput?: (value: string) => void;
  onSubmitInput?: (value: string) => void;
  submitLabel?: string;

  snapPoints?: (string | number)[];
  enableBackdropPressToClose?: boolean;
  testID?: string;
}

export interface VariantConfig {
  color: string;
  icon: string;
  label: string;
}

// Improved Analysis interface to replace 'any' type usage
export interface Analysis {
  confidence?: number;
  summary?: string;
  techniques?: Technique[];
  variant?: Variant;
  [key: string]: any; // Allow additional properties for backward compatibility
}

// Updated props interface for ContentAnalysisSheetV2
export interface ContentAnalysisSheetV2Props {
  content: string;
  analysis: Analysis; // Replace 'any' with proper typing
  isLoading?: boolean;
  isVisible: boolean;
  onClose: () => void;
  sharedContent?: string;
  sharedContentType?: 'url' | 'text' | 'audio' | 'trending';
  sources?: SourceInfo[];
  isTrendingAnalysis?: boolean;
}

export const VARIANT_CONFIGS: Record<Variant, VariantConfig> = {
  loading: {
    color: '#9CA3AF',
    icon: 'loader',
    label: 'Analyzing...'
  },
  deceptive: {
    color: '#EF4444',
    icon: 'alert-octagon',
    label: 'Deceptive Content'
  },
  safe: {
    color: '#10B981',
    icon: 'shield-check',
    label: 'Safe Content'
  },
  satire: {
    color: '#8B5CF6',
    icon: 'sparkles',
    label: 'Satire / Meme'
  },
  error: {
    color: '#6B7280',
    icon: 'alert-triangle',
    label: 'Analysis Error'
  }
};