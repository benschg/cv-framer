import type { CoverLetter, CoverLetterContent, JobContext } from '@/types/cv.types';

const API_BASE = '/api';

export interface CoverLetterServiceResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetch all cover letters for the current user
 */
export async function fetchCoverLetters(): Promise<CoverLetterServiceResponse<CoverLetter[]>> {
  try {
    const response = await fetch(`${API_BASE}/cover-letter`);
    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to fetch cover letters' };
    }

    return { data: json.coverLetters || [], error: null };
  } catch (error) {
    console.error('fetchCoverLetters error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Fetch a single cover letter by ID
 */
export async function fetchCoverLetter(id: string): Promise<CoverLetterServiceResponse<CoverLetter>> {
  try {
    const response = await fetch(`${API_BASE}/cover-letter/${id}`);
    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to fetch cover letter' };
    }

    return { data: json.coverLetter, error: null };
  } catch (error) {
    console.error('fetchCoverLetter error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Create a new cover letter
 */
export async function createCoverLetter(data: {
  name: string;
  language?: 'en' | 'de';
  cv_id?: string;
  content?: CoverLetterContent;
  job_context?: JobContext;
}): Promise<CoverLetterServiceResponse<CoverLetter>> {
  try {
    const response = await fetch(`${API_BASE}/cover-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to create cover letter' };
    }

    return { data: json.coverLetter, error: null };
  } catch (error) {
    console.error('createCoverLetter error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Update a cover letter
 */
export async function updateCoverLetter(
  id: string,
  data: Partial<{
    name: string;
    content: CoverLetterContent;
    job_context: JobContext;
    cv_id: string;
    is_archived: boolean;
  }>
): Promise<CoverLetterServiceResponse<CoverLetter>> {
  try {
    const response = await fetch(`${API_BASE}/cover-letter/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to update cover letter' };
    }

    return { data: json.coverLetter, error: null };
  } catch (error) {
    console.error('updateCoverLetter error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Delete a cover letter
 */
export async function deleteCoverLetter(
  id: string,
  hard: boolean = false
): Promise<CoverLetterServiceResponse<boolean>> {
  try {
    const url = hard ? `${API_BASE}/cover-letter/${id}?hard=true` : `${API_BASE}/cover-letter/${id}`;
    const response = await fetch(url, { method: 'DELETE' });

    if (!response.ok) {
      const json = await response.json();
      return { data: null, error: json.error || 'Failed to delete cover letter' };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('deleteCoverLetter error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Generate cover letter content using AI
 */
export async function generateCoverLetterWithAI(options: {
  coverLetterId?: string;
  cvId?: string;
  language?: 'en' | 'de';
  jobContext?: JobContext;
}): Promise<CoverLetterServiceResponse<{ content: CoverLetterContent }>> {
  try {
    const response = await fetch(`${API_BASE}/generate-cover-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cover_letter_id: options.coverLetterId,
        cv_id: options.cvId,
        language: options.language || 'en',
        job_context: options.jobContext,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to generate cover letter' };
    }

    return { data: json, error: null };
  } catch (error) {
    console.error('generateCoverLetterWithAI error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Get default cover letter content structure
 */
export function getDefaultCoverLetterContent(): CoverLetterContent {
  return {
    recipientName: '',
    recipientTitle: '',
    companyName: '',
    companyAddress: '',
    date: new Date().toISOString().split('T')[0],
    subject: '',
    greeting: '',
    opening: '',
    body: '',
    closing: '',
    signature: '',
  };
}
