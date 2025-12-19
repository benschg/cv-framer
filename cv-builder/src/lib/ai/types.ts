/**
 * Shared type definitions for AI/Gemini service functions.
 */

// Available Gemini models
export type GeminiModel =
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-thinking-exp'
  | 'gemini-1.5-flash'
  | 'gemini-1.5-pro';

// Types for CV generation
export interface CompanyResearchResult {
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

export interface GeneratedCVContent {
  tagline?: string;
  profile?: string;
  slogan?: string;
}

// Types for job posting URL parsing
export interface ParsedJobPosting {
  company: string;
  position: string;
  jobDescription: string;
  location?: string;
  employmentType?: string;
  salary?: string;
  contactName?: string;
  contactEmail?: string;
}

// Types for certification document extraction
export interface ExtractedCertificationData {
  name: string | null;
  issuer: string | null;
  date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  url: string | null;
}

export interface CertificationExtraction {
  extractedData: ExtractedCertificationData;
  confidence: {
    name: number;
    issuer: number;
    date: number;
    expiry_date: number;
    credential_id: number;
    url: number;
  };
  reasoning: string;
}

// Types for reference document extraction
export interface ExtractedReferenceData {
  name: string | null;
  title: string | null;
  company: string | null;
  relationship: string | null;
  email: string | null;
  phone: string | null;
  quote: string | null;
}

export interface ReferenceExtraction {
  extractedData: ExtractedReferenceData;
  confidence: {
    name: number;
    title: number;
    company: number;
    relationship: number;
    email: number;
    phone: number;
    quote: number;
  };
  reasoning: string;
}

// Types for cover letter generation
export interface GeneratedCoverLetterContent {
  subject?: string;
  greeting?: string;
  opening?: string;
  body?: string;
  closing?: string;
}

// Types for CV upload extraction
export interface ExtractedCVData {
  workExperiences: Array<{
    company: string | null;
    title: string | null;
    location: string | null;
    start_date: string | null; // YYYY-MM
    end_date: string | null;
    current: boolean;
    description: string | null;
    bullets: string[];
  }>;
  educations: Array<{
    institution: string | null;
    degree: string | null;
    field: string | null;
    start_date: string | null;
    end_date: string | null;
    grade: string | null;
    description: string | null;
  }>;
  skillCategories: Array<{
    category: string | null;
    skills: string[];
  }>;
  keyCompetences: Array<{
    title: string | null;
    description: string | null;
  }>;
  certifications: Array<{
    name: string | null;
    issuer: string | null;
    date: string | null;
    expiry_date: string | null;
    credential_id: string | null;
    url: string | null;
  }>;
}

export interface CVExtractionResult {
  extractedData: ExtractedCVData;
  confidence: {
    workExperiences: number;
    educations: number;
    skillCategories: number;
    keyCompetences: number;
    certifications: number;
  };
  sectionCounts: {
    workExperiences: number;
    educations: number;
    skillCategories: number;
    keyCompetences: number;
    certifications: number;
  };
  reasoning: string;
}

// Types for Profile Data Extraction
export interface ExtractedProfileData {
  motivationVision?: {
    vision?: string;
    mission?: string;
    purpose?: string;
    what_drives_you?: string;
    why_this_field?: string;
    career_goals?: string;
    passions?: string[];
    how_passions_relate?: string;
  };
  highlights?: Array<{
    type: 'highlight' | 'achievement' | 'mehrwert' | 'usp';
    title: string;
    description?: string;
    metric?: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    role?: string;
    technologies?: string[];
    url?: string;
    start_date?: string;
    end_date?: string;
    current?: boolean;
    outcome?: string;
  }>;
}

export interface ProfileExtractionResult {
  extractedData: ExtractedProfileData;
  confidence: {
    motivationVision: number;
    highlights: number;
    projects: number;
  };
  sectionCounts: {
    motivationVision: number;
    highlights: number;
    projects: number;
  };
  reasoning: string;
}
