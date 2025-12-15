import type {
  CVDocument,
  CreateCVInput,
  UpdateCVInput,
  GenerateCVInput,
  RegenerateItemInput,
} from '@/types/api.schemas';

const API_BASE = '/api/cv';

export interface CVServiceResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetch all CVs for the current user
 */
export async function fetchAllCVs(): Promise<CVServiceResponse<CVDocument[]>> {
  try {
    const response = await fetch(API_BASE);
    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to fetch CVs' };
    }

    return { data: json.cvs, error: null };
  } catch (error) {
    console.error('fetchAllCVs error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Fetch a specific CV by ID
 */
export async function fetchCV(id: string): Promise<CVServiceResponse<CVDocument>> {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to fetch CV' };
    }

    return { data: json.cv, error: null };
  } catch (error) {
    console.error('fetchCV error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Create a new CV
 */
export async function createCV(data: CreateCVInput): Promise<CVServiceResponse<CVDocument>> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to create CV' };
    }

    return { data: json.cv, error: null };
  } catch (error) {
    console.error('createCV error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Update an existing CV
 */
export async function updateCV(
  id: string,
  data: UpdateCVInput
): Promise<CVServiceResponse<CVDocument>> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to update CV' };
    }

    return { data: json.cv, error: null };
  } catch (error) {
    console.error('updateCV error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Delete a CV
 */
export async function deleteCV(id: string): Promise<CVServiceResponse<boolean>> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: false, error: json.error || 'Failed to delete CV' };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('deleteCV error:', error);
    return { data: false, error: 'Network error' };
  }
}

/**
 * Duplicate a CV
 */
export async function duplicateCV(id: string, newName?: string): Promise<CVServiceResponse<CVDocument>> {
  try {
    const response = await fetch(`${API_BASE}/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to duplicate CV' };
    }

    return { data: json.cv, error: null };
  } catch (error) {
    console.error('duplicateCV error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Generate CV content using AI
 */
export async function generateCVContent(data: GenerateCVInput): Promise<CVServiceResponse<Record<string, unknown>>> {
  try {
    const response = await fetch('/api/generate-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to generate content' };
    }

    return { data: json.content, error: null };
  } catch (error) {
    console.error('generateCVContent error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Regenerate a specific CV item/section using AI
 */
export async function regenerateItem(data: RegenerateItemInput): Promise<CVServiceResponse<{
  section: string;
  content: string | string[];
}>> {
  try {
    const response = await fetch('/api/regenerate-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to regenerate item' };
    }

    return { data: { section: json.section, content: json.content }, error: null };
  } catch (error) {
    console.error('regenerateItem error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Export CV to PDF
 */
export async function exportCVToPDF(
  id: string,
  options?: {
    theme?: 'light' | 'dark';
    showPhoto?: boolean;
    privacyLevel?: 'personal' | 'professional' | 'public';
  }
): Promise<CVServiceResponse<Blob>> {
  try {
    const params = new URLSearchParams();
    if (options?.theme) params.set('theme', options.theme);
    if (options?.showPhoto !== undefined) params.set('showPhoto', String(options.showPhoto));
    if (options?.privacyLevel) params.set('privacyLevel', options.privacyLevel);

    const url = `/api/generate-pdf/${id}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      const json = await response.json();
      return { data: null, error: json.error || 'Failed to generate PDF' };
    }

    const blob = await response.blob();
    return { data: blob, error: null };
  } catch (error) {
    console.error('exportCVToPDF error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Generate a unique ID for new items
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get default CV content structure
 */
export function getDefaultCVContent(): Record<string, unknown> {
  return {
    summary: '',
    languages: [],
    certifications: [],
  };
}

/**
 * Get default display settings
 */
export function getDefaultDisplaySettings(): Record<string, unknown> {
  return {
    theme: 'light',
    showPhoto: true,
    showAttachments: false,
    privacyLevel: 'personal',
  };
}
