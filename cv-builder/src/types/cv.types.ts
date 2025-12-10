export interface CVDocument {
  id: string;
  user_id: string;
  template_id?: string;
  name: string;
  description?: string;
  language: 'en' | 'de';
  content: CVContent;
  job_context?: JobContext;
  ai_metadata?: AIMetadata;
  werbeflaechen_snapshot?: WerbeflaechenSnapshot;
  display_settings: DisplaySettings;
  is_default: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CVContent {
  tagline?: string;
  profile?: string;
  slogan?: string;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: SkillCategory[];
  keyCompetences?: KeyCompetence[];
  projects?: Project[];
  references?: Reference[];
  languages?: Language[];
  certifications?: Certification[];
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  grade?: string;
}

export interface SkillCategory {
  id: string;
  category: string;
  skills: string[];
}

export interface KeyCompetence {
  id: string;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  role?: string;
  technologies?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  relationship?: string;
  email?: string;
  phone?: string;
  quote?: string;
}

export interface Language {
  id: string;
  name: string;
  level: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  expiryDate?: string;
  url?: string;
  credentialId?: string;
}

export interface JobContext {
  company?: string;
  position?: string;
  jobPosting?: string;
  jobPostingUrl?: string;
  companyWebsite?: string;
  customInstructions?: string;
  companyResearch?: CompanyResearch;
}

export interface CompanyResearch {
  company: {
    name: string;
    industry?: string;
    culture?: string[];
    values?: string[];
    techStack?: string[];
    size?: string;
  };
  role: {
    title: string;
    level?: string;
    responsibilities?: string[];
    requiredSkills?: string[];
    preferredSkills?: string[];
    keywords?: string[];
  };
  insights?: {
    whatTheyValue?: string;
    toneGuidance?: string;
    keyMatches?: string[];
    gaps?: string[];
  };
}

export interface AIMetadata {
  model: string;
  promptVersion: string;
  generatedAt: string;
  sectionsGenerated?: string[];
}

export interface DisplaySettings {
  theme: 'light' | 'dark';
  showPhoto: boolean;
  showExperience: boolean;
  showAttachments: boolean;
  privacyLevel: 'none' | 'personal' | 'full';
  accentColor?: string;
  fontFamily?: string;
}

export interface WerbeflaechenSnapshot {
  capturedAt: string;
  language: 'en' | 'de';
  categories: Record<string, unknown>;
}

// CV Template types
export interface CVTemplate {
  id: string;
  name: string;
  description?: string;
  preview_image_url?: string;
  layout_config: LayoutConfig;
  style_config: StyleConfig;
  is_public: boolean;
  is_default: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface LayoutConfig {
  columns: 1 | 2;
  sidebarWidth?: string;
  sections: string[];
  pageBreaks?: number[];
}

export interface StyleConfig {
  fontFamily: string;
  primaryColor: string;
  accentColor: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'relaxed';
}

// User profile for header info
export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  photo_url?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  portfolio_url?: string;
  default_tagline?: string;
  default_profile?: string;
  preferred_language: 'en' | 'de';
  timezone?: string;
  created_at: string;
  updated_at: string;
}
