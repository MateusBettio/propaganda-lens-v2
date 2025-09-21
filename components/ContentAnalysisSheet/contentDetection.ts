/**
 * Content detection data and logic
 * Extracted from ContentAnalysisSheetV2 for better maintainability
 */

export interface DetectionItem {
  id: string;
  icon: any;
  title: string;
  description: string;
  detailedContent: string;
  category: 'biases' | 'emotional' | 'logical' | 'credibility';
}

export interface ContentCategory {
  label: string;
  icon: string;
  items: DetectionItem[];
}

// Content detection patterns
const CONTENT_PATTERNS = {
  covid: ['who.int', 'COVID', 'covid'],
  conflict: ['bbc.com', 'Hamas-Israel War'],
  gunControl: ['apnews.com', 'Anti-Gun Propaganda'],
} as const;

export type ContentType = keyof typeof CONTENT_PATTERNS;

// Detection data sets
const COVID_ITEMS: DetectionItem[] = [
  {
    id: 'covid-misinfo',
    icon: require('../../assets/analysis-icons/covid-19.png'),
    title: 'COVID-19 Misinformation',
    description: 'Vaccine skepticism and anti-mandate rhetoric',
    detailedContent: 'This content promotes vaccine hesitancy by questioning safety data, spreading unverified claims about side effects, and portraying public health measures as authoritarian overreach. Common tactics include cherry-picking isolated cases, misrepresenting scientific studies, and appealing to personal freedom over collective health.',
    category: 'credibility'
  },
  {
    id: 'authority-appeal',
    icon: require('../../assets/analysis-icons/authority.png'),
    title: 'Appeal to Authority',
    description: 'Using "trust the science" without evidence',
    detailedContent: 'The content uses appeal to authority fallacies by invoking scientific credibility without providing actual evidence. Phrases like "trust the science" are used as conversation stoppers, while dissenting expert voices are dismissed or marginalized. This creates an illusion of scientific consensus where none may exist.',
    category: 'logical'
  },
  {
    id: 'fear-mongering',
    icon: require('../../assets/analysis-icons/fear.png'),
    title: 'Fear Mongering',
    description: 'Exaggerating dangers to influence behavior',
    detailedContent: 'Fear-based messaging amplifies worst-case scenarios to drive compliance with health measures. This includes highlighting rare adverse events, using apocalyptic language about virus variants, and creating anxiety about social consequences of non-compliance. The goal is emotional manipulation rather than rational persuasion.',
    category: 'emotional'
  },
  {
    id: 'govt-narrative',
    icon: require('../../assets/analysis-icons/government.png'),
    title: 'Government Narrative',
    description: 'Promoting official health policy positions',
    detailedContent: 'The content aligns closely with government health policies without acknowledging potential conflicts of interest or alternative viewpoints. Official statements are presented as unquestionable truth, and policy changes are framed as "following the science" rather than political or economic decisions.',
    category: 'biases'
  },
  {
    id: 'pharma-influence',
    icon: require('../../assets/analysis-icons/pharma.png'),
    title: 'Pharmaceutical Influence',
    description: 'Potential industry-backed messaging',
    detailedContent: 'The messaging shows potential pharmaceutical industry influence through uncritical promotion of medical interventions, downplaying of financial incentives, and exclusion of non-pharmaceutical solutions. Industry-funded studies are presented without disclosure of conflicts of interest.',
    category: 'biases'
  }
];

const CONFLICT_ITEMS: DetectionItem[] = [
  {
    id: 'conflict-misinfo',
    icon: require('../../assets/analysis-icons/government.png'),
    title: 'Conflict Misinformation',
    description: 'False casualty numbers and fabricated incidents',
    detailedContent: 'The content spreads unverified casualty figures, promotes debunked stories of atrocities, or presents staged incidents as authentic. This includes using old footage from other conflicts, misrepresenting civilian vs. military casualties, and amplifying unconfirmed reports without proper verification.',
    category: 'credibility'
  },
  {
    id: 'emotional-manipulation',
    icon: require('../../assets/analysis-icons/fear.png'),
    title: 'Emotional Manipulation',
    description: 'Using graphic imagery to trigger outrage',
    detailedContent: 'The content exploits human suffering through graphic images and videos designed to provoke immediate emotional responses rather than rational analysis. This includes sharing images of injured children, destroyed buildings, or grieving families to bypass critical thinking and generate support for one side.',
    category: 'emotional'
  },
  {
    id: 'selective-context',
    icon: require('../../assets/analysis-icons/framing.png'),
    title: 'Selective Context',
    description: 'Omitting key background information',
    detailedContent: 'The narrative deliberately excludes crucial context that would provide a more complete picture. This includes ignoring historical provocations, omitting details about military targets vs. civilian areas, or failing to mention the sequence of events leading to specific incidents.',
    category: 'biases'
  },
  {
    id: 'loaded-language',
    icon: require('../../assets/analysis-icons/inflamatory.png'),
    title: 'Loaded Language',
    description: '"Genocide", "ethnic cleansing", "apartheid"',
    detailedContent: 'The content employs emotionally charged terms that carry specific historical and legal meanings to describe current events. Words like "genocide" and "ethnic cleansing" are used without meeting their legal definitions, while terms like "apartheid" are applied anachronistically to inflame rather than inform.',
    category: 'emotional'
  },
  {
    id: 'false-equivalence',
    icon: require('../../assets/analysis-icons/authority.png'),
    title: 'False Moral Equivalence',
    description: 'Equating terrorist acts with self-defense',
    detailedContent: 'The content creates false moral equivalencies between targeted attacks on civilians and military responses to those attacks. This includes portraying terrorist organizations as freedom fighters or equating defensive military actions with offensive terrorism, obscuring important distinctions in international law.',
    category: 'logical'
  }
];

const GUN_CONTROL_ITEMS: DetectionItem[] = [
  {
    id: 'tragedy-exploitation',
    icon: require('../../assets/analysis-icons/covid-19.png'),
    title: 'Tragedy Exploitation',
    description: 'Using fresh grief to push immediate legislation',
    detailedContent: 'The content capitalizes on mass shooting tragedies by demanding immediate policy action while emotions are high and rational debate is discouraged. This includes platforming grieving families as policy advocates, using "never again" rhetoric to shut down discussion, and framing any delay in legislation as complicity in future violence.',
    category: 'emotional'
  },
  {
    id: 'fear-mongering-guns',
    icon: require('../../assets/analysis-icons/fear.png'),
    title: 'Fear Mongering',
    description: '"Your children aren\'t safe at school"',
    detailedContent: 'The messaging amplifies parental fears by exaggerating the statistical risk of school shootings and portraying schools as war zones. This includes sensationalizing rare events, ignoring actual crime statistics, and creating anxiety that drives support for restrictive policies regardless of their effectiveness.',
    category: 'emotional'
  },
  {
    id: 'weaponized-language',
    icon: require('../../assets/analysis-icons/inflamatory.png'),
    title: 'Weaponized Language',
    description: '"Assault weapons", "weapons of war"',
    detailedContent: 'The content uses militaristic terminology to describe civilian firearms, creating false associations with battlefield weapons. Terms like "assault weapon" are used for cosmetic features rather than function, while "weapons of war" rhetoric ignores that many civilian firearms have military origins or applications.',
    category: 'emotional'
  },
  {
    id: 'statistical-manipulation',
    icon: require('../../assets/analysis-icons/authority.png'),
    title: 'Statistical Manipulation',
    description: 'Inflated gun violence numbers and cherry-picking',
    detailedContent: 'The content presents misleading statistics by including suicides in "gun violence" numbers, counting gang violence as mass shootings, or comparing countries with different demographics and crime patterns. Data is selectively presented to support predetermined conclusions while ignoring contradictory evidence.',
    category: 'logical'
  },
  {
    id: 'constitutional-gaslighting',
    icon: require('../../assets/analysis-icons/government.png'),
    title: 'Constitutional Gaslighting',
    description: '"Well regulated militia" misinterpretation',
    detailedContent: 'The content promotes outdated interpretations of the Second Amendment that have been rejected by Supreme Court precedent. This includes claiming the amendment only protects military service members, ignoring individual rights confirmed in Heller and McDonald decisions, or arguing the founders couldn\'t envision modern firearms.',
    category: 'biases'
  }
];

const FALLBACK_ITEMS: DetectionItem[] = [
  {
    id: 'general-analysis',
    icon: require('../../assets/analysis-icons/unknown.png'),
    title: 'General Analysis',
    description: 'Various propaganda techniques detected',
    detailedContent: 'This content contains multiple propaganda techniques that require careful analysis. The messaging may include emotional appeals, selective presentation of facts, loaded language, or other persuasive techniques designed to influence opinion rather than inform. A more detailed analysis would require examination of specific claims and their supporting evidence.',
    category: 'biases'
  }
];

// Content type detection
export function detectContentType(content: string): ContentType | null {
  for (const [type, patterns] of Object.entries(CONTENT_PATTERNS)) {
    if (patterns.some(pattern => content.includes(pattern))) {
      return type as ContentType;
    }
  }
  return null;
}

// Get detection items for content type
export function getDetectionItems(contentType: ContentType | null): DetectionItem[] {
  switch (contentType) {
    case 'covid':
      return COVID_ITEMS;
    case 'conflict':
      return CONFLICT_ITEMS;
    case 'gunControl':
      return GUN_CONTROL_ITEMS;
    default:
      return FALLBACK_ITEMS;
  }
}

// Group items by category
export function categorizeDetectionItems(items: DetectionItem[]): Record<string, ContentCategory> {
  const categories = {
    biases: { label: 'Biases', icon: 'eye-off-outline', items: [] as DetectionItem[] },
    emotional: { label: 'Emotional Manipulation', icon: 'heart-dislike-outline', items: [] as DetectionItem[] },
    logical: { label: 'Logical Fallacies', icon: 'git-branch-outline', items: [] as DetectionItem[] },
    credibility: { label: 'Source Credibility', icon: 'shield-checkmark-outline', items: [] as DetectionItem[] },
  };

  items.forEach(item => {
    categories[item.category].items.push(item);
  });

  return categories;
}

// Get content title and description for display
export function getContentDisplayInfo(contentType: ContentType | null) {
  switch (contentType) {
    case 'covid':
      return {
        title: 'COVID-19 Propaganda',
        description: 'Identifying misinformation and propaganda techniques\nin COVID-19 related content',
        icon: require('../../assets/analysis-icons/covid-19.png')
      };
    case 'conflict':
      return {
        title: 'Hamas-Israel War Propaganda',
        description: 'Analyzing propaganda and bias in conflict-related content',
        icon: require('../../assets/analysis-icons/government.png')
      };
    case 'gunControl':
      return {
        title: 'Anti-Gun Propaganda',
        description: 'Detecting emotional manipulation in gun control messaging',
        icon: require('../../assets/analysis-icons/anti-free-speech.png')
      };
    default:
      return {
        title: 'Analysis Results',
        description: 'Detailed propaganda analysis of the content',
        icon: require('../../assets/analysis-icons/unknown.png')
      };
  }
}