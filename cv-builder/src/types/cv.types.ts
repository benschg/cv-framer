// Import and re-export main entity types from api.schemas (these match DB schema with nullable fields)
import type {
  CVDocument as CVDocumentType,
  CoverLetter as CoverLetterType,
  JobApplication as JobApplicationType,
  ShareLink as ShareLinkType,
  ApplicationStatus as ApplicationStatusType,
  Language as LanguageType,
} from './api.schemas';

export type CVDocument = CVDocumentType;
export type CoverLetter = CoverLetterType;
export type JobApplication = JobApplicationType;
export type ShareLink = ShareLinkType;
export type ApplicationStatus = ApplicationStatusType;
export type Language = LanguageType;

// Local interface for CV content structure (used in CV editor)
export interface CVDocumentLocal {
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
  languages?: LanguageSkill[];
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

export interface LanguageSkill {
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

// Share link types (ShareLink entity type re-exported from api.schemas)

export interface ShareLinkVisit {
  id: string;
  share_link_id: string;
  visitor_ip?: string;
  user_agent?: string;
  referrer?: string;
  visited_at: string;
}

// Cover Letter content types (CoverLetter entity type re-exported from api.schemas)

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

// Application Tracker types (ApplicationStatus and JobApplication re-exported from api.schemas)

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
  icon: 'FileEdit' | 'Send' | 'Search' | 'Users' | 'Gift' | 'CheckCircle' | 'XCircle' | 'Undo2';
}> = {
  draft: {
    label: 'Draft',
    labelDe: 'Entwurf',
    color: 'text-status-draft',
    bgColor: 'bg-status-draft/10',
    order: 0,
    icon: 'FileEdit',
  },
  applied: {
    label: 'Applied',
    labelDe: 'Beworben',
    color: 'text-status-applied',
    bgColor: 'bg-status-applied/10',
    order: 1,
    icon: 'Send',
  },
  screening: {
    label: 'Screening',
    labelDe: 'Vorauswahl',
    color: 'text-status-screening',
    bgColor: 'bg-status-screening/10',
    order: 2,
    icon: 'Search',
  },
  interview: {
    label: 'Interview',
    labelDe: 'Interview',
    color: 'text-status-interview',
    bgColor: 'bg-status-interview/10',
    order: 3,
    icon: 'Users',
  },
  offer: {
    label: 'Offer',
    labelDe: 'Angebot',
    color: 'text-status-offer',
    bgColor: 'bg-status-offer/10',
    order: 4,
    icon: 'Gift',
  },
  accepted: {
    label: 'Accepted',
    labelDe: 'Angenommen',
    color: 'text-status-accepted',
    bgColor: 'bg-status-accepted/10',
    order: 5,
    icon: 'CheckCircle',
  },
  rejected: {
    label: 'Rejected',
    labelDe: 'Abgelehnt',
    color: 'text-status-rejected',
    bgColor: 'bg-status-rejected/10',
    order: 6,
    icon: 'XCircle',
  },
  withdrawn: {
    label: 'Withdrawn',
    labelDe: 'Zurückgezogen',
    color: 'text-status-withdrawn',
    bgColor: 'bg-status-withdrawn/10',
    order: 7,
    icon: 'Undo2',
  },
};
