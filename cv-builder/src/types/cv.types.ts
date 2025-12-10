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

// Share link types
export interface ShareLink {
  id: string;
  cv_id: string;
  user_id: string;
  share_token: string;
  privacy_level: 'none' | 'personal' | 'full';
  is_active: boolean;
  expires_at?: string;
  password_hash?: string;
  view_count: number;
  last_viewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ShareLinkVisit {
  id: string;
  share_link_id: string;
  visitor_ip?: string;
  user_agent?: string;
  referrer?: string;
  visited_at: string;
}

// Cover Letter types
export interface CoverLetter {
  id: string;
  user_id: string;
  cv_id?: string;
  name: string;
  language: 'en' | 'de';
  content: CoverLetterContent;
  job_context?: JobContext;
  ai_metadata?: AIMetadata;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoverLetterContent {
  recipientName?: string;
  recipientTitle?: string;
  companyName?: string;
  companyAddress?: string;
  date?: string;
  subject?: string;
  greeting?: string;
  opening?: string;
  body?: string;
  closing?: string;
  signature?: string;
}

// Application Tracker types
export type ApplicationStatus =
  | 'draft'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'accepted'
  | 'withdrawn';

export interface JobApplication {
  id: string;
  user_id: string;
  cv_id?: string;
  cover_letter_id?: string;
  company_name: string;
  job_title: string;
  job_url?: string;
  job_description?: string;
  location?: string;
  salary_range?: string;
  status: ApplicationStatus;
  applied_at?: string;
  deadline?: string;
  notes?: string;
  contact_name?: string;
  contact_email?: string;
  fit_analysis?: FitAnalysis;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface FitAnalysis {
  overall_score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  analyzed_at: string;
}

export interface ApplicationEvent {
  id: string;
  application_id: string;
  event_type: ApplicationEventType;
  title: string;
  description?: string;
  scheduled_at?: string;
  completed_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export type ApplicationEventType =
  | 'status_change'
  | 'note_added'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'offer_received'
  | 'follow_up'
  | 'document_sent'
  | 'custom';

export interface ApplicationNote {
  id: string;
  application_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Application status metadata for UI
export const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, {
  label: string;
  labelDe: string;
  color: string;
  bgColor: string;
  order: number;
}> = {
  draft: {
    label: 'Draft',
    labelDe: 'Entwurf',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    order: 0,
  },
  applied: {
    label: 'Applied',
    labelDe: 'Beworben',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    order: 1,
  },
  screening: {
    label: 'Screening',
    labelDe: 'Vorauswahl',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    order: 2,
  },
  interview: {
    label: 'Interview',
    labelDe: 'Interview',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    order: 3,
  },
  offer: {
    label: 'Offer',
    labelDe: 'Angebot',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    order: 4,
  },
  accepted: {
    label: 'Accepted',
    labelDe: 'Angenommen',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    order: 5,
  },
  rejected: {
    label: 'Rejected',
    labelDe: 'Abgelehnt',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    order: 6,
  },
  withdrawn: {
    label: 'Withdrawn',
    labelDe: 'Zurückgezogen',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    order: 7,
  },
};
