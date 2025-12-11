export type CategoryKey =
  | 'vision_mission'
  | 'motivation'
  | 'passion'
  | 'slogan'
  | 'zitat_motto'
  | 'highlights'
  | 'erfolge'
  | 'mehrwert'
  | 'projekte'
  | 'referenzen'
  | 'usp'
  | 'corporate_design'
  | 'erfahrungswissen'
  | 'kernkompetenzen'
  | 'schluesselkompetenzen'
  | 'kurzprofil'
  | 'berufliche_erfahrungen'
  | 'aus_weiterbildungen';

export type RowNumber = 1 | 2 | 3;

export interface WerbeflaechenEntry {
  id: string;
  user_id: string;
  language: 'en' | 'de';
  category_key: CategoryKey;
  row_number?: number;
  content: Record<string, unknown>;
  is_complete: boolean;
  cv_coverage?: number;
  job_match?: number;
  fit_reasoning?: string;
  ai_reasoning?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface CategoryMetadata {
  row: RowNumber;
  order: number;
  color: string;
  icon: string;
  beginner: boolean;
}

export interface CategoryTranslations {
  en: string;
  de: string;
  description_en: string;
  description_de: string;
}

export interface CategoryDefinition extends CategoryMetadata, CategoryTranslations {
  key: CategoryKey;
}

// Content structures for different category types
export interface VisionMissionContent {
  vision?: string;
  mission?: string;
  purpose?: string;
}

export interface MotivationContent {
  whatDrivesYou?: string;
  whyThisField?: string;
  careerGoals?: string;
}

export interface PassionContent {
  passions?: string[];
  howTheyRelateToWork?: string;
}

export interface SloganContent {
  slogan?: string;
  tagline?: string;
}

export interface HighlightsContent {
  highlights?: Array<{
    title: string;
    description: string;
  }>;
}

export interface ErfolgeContent {
  achievements?: Array<{
    title: string;
    description: string;
    metric?: string;
  }>;
}

export interface ProjekteContent {
  projects?: Array<{
    name: string;
    description: string;
    role?: string;
    technologies?: string[];
    outcome?: string;
  }>;
}

export interface USPContent {
  uniqueSellingPoints?: Array<{
    title: string;
    description: string;
  }>;
}

export interface KernkompetenzenContent {
  skills?: Array<{
    category: string;
    items: string[];
  }>;
}

export interface SchluesselkompetenzenContent {
  softSkills?: string[];
  competencies?: Array<{
    name: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }>;
}

export interface KurzprofilContent {
  summary?: string;
  professionalTitle?: string;
  yearsExperience?: number;
}

export interface BeruflicheErfahrungenContent {
  experiences?: Array<{
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    bullets?: string[];
  }>;
}

export interface AusWeiterbildungenContent {
  education?: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
    url?: string;
  }>;
}

export interface ReferenzenContent {
  references?: Array<{
    name: string;
    title: string;
    company: string;
    relationship?: string;
    email?: string;
    phone?: string;
    quote?: string;
  }>;
}

// Union type for all content types
export type WerbeflaechenContent =
  | VisionMissionContent
  | MotivationContent
  | PassionContent
  | SloganContent
  | HighlightsContent
  | ErfolgeContent
  | ProjekteContent
  | USPContent
  | KernkompetenzenContent
  | SchluesselkompetenzenContent
  | KurzprofilContent
  | BeruflicheErfahrungenContent
  | AusWeiterbildungenContent
  | ReferenzenContent;
