import type { CVContent, JobContext, CompanyResearch } from '@/types/cv.types';

const API_BASE = '/api';

export interface AIServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export interface GenerateCVResponse {
  content: Partial<CVContent>;
  companyResearch?: CompanyResearch;
  ai_metadata: {
    model: string;
    promptVersion: string;
    generatedAt: string;
  };
}

export interface RegenerateItemResponse {
  section: string;
  content: string | string[];
  ai_metadata: {
    model: string;
    regeneratedAt: string;
  };
}

/**
 * Generate CV content using AI
 */
export async function generateCVWithAI(options: {
  cvId?: string;
  language?: 'en' | 'de';
  sections?: string[];
  jobContext?: JobContext;
  analyzeJobPosting?: boolean;
}): Promise<AIServiceResponse<GenerateCVResponse>> {
  try {
    const response = await fetch(`${API_BASE}/generate-cv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cv_id: options.cvId,
        language: options.language || 'en',
        sections: options.sections,
        job_context: options.jobContext,
        analyze_job_posting: options.analyzeJobPosting ?? true,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to generate CV content' };
    }

    return { data: json, error: null };
  } catch (error) {
    console.error('generateCVWithAI error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Regenerate a single section or item
 */
export async function regenerateItem(options: {
  cvId?: string;
  section: string;
  currentContent?: string;
  customInstructions?: string;
  language?: 'en' | 'de';
  experienceContext?: {
    company: string;
    title: string;
    description?: string;
  };
}): Promise<AIServiceResponse<RegenerateItemResponse>> {
  try {
    const response = await fetch(`${API_BASE}/regenerate-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cv_id: options.cvId,
        section: options.section,
        current_content: options.currentContent,
        custom_instructions: options.customInstructions,
        language: options.language || 'en',
        experience_context: options.experienceContext,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to regenerate content' };
    }

    return { data: json, error: null };
  } catch (error) {
    console.error('regenerateItem error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Generate experience bullets for a work experience entry
 */
export async function generateExperienceBullets(options: {
  cvId?: string;
  company: string;
  title: string;
  description?: string;
  language?: 'en' | 'de';
}): Promise<AIServiceResponse<string[]>> {
  const result = await regenerateItem({
    cvId: options.cvId,
    section: 'experience_bullets',
    language: options.language,
    experienceContext: {
      company: options.company,
      title: options.title,
      description: options.description,
    },
  });

  if (result.error) {
    return { data: null, error: result.error };
  }

  return {
    data: Array.isArray(result.data?.content) ? result.data.content : [],
    error: null,
  };
}
