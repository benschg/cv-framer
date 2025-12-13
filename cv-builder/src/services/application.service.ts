import type {
  JobApplication,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput,
  ApplicationStatsResponse,
} from '@/types/api.schemas';

const API_BASE = '/api';

export interface ApplicationServiceResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetch all applications for the current user
 */
export async function fetchApplications(options?: {
  status?: ApplicationStatus;
  includeArchived?: boolean;
}): Promise<ApplicationServiceResponse<JobApplication[]>> {
  try {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.includeArchived) params.set('includeArchived', 'true');

    const url = params.toString()
      ? `${API_BASE}/applications?${params.toString()}`
      : `${API_BASE}/applications`;

    const response = await fetch(url);
    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to fetch applications' };
    }

    return { data: json.applications || [], error: null };
  } catch (error) {
    console.error('fetchApplications error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Fetch a single application by ID
 */
export async function fetchApplication(id: string): Promise<ApplicationServiceResponse<JobApplication>> {
  try {
    const response = await fetch(`${API_BASE}/applications/${id}`);
    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to fetch application' };
    }

    return { data: json.application, error: null };
  } catch (error) {
    console.error('fetchApplication error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Create a new application
 */
export async function createApplication(
  data: CreateApplicationInput
): Promise<ApplicationServiceResponse<JobApplication>> {
  try {
    const response = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to create application' };
    }

    return { data: json.application, error: null };
  } catch (error) {
    console.error('createApplication error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Update an application
 */
export async function updateApplication(
  id: string,
  data: UpdateApplicationInput
): Promise<ApplicationServiceResponse<JobApplication>> {
  try {
    const response = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to update application' };
    }

    return { data: json.application, error: null };
  } catch (error) {
    console.error('updateApplication error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Update application status (convenience method)
 */
export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<ApplicationServiceResponse<JobApplication>> {
  const updates: UpdateApplicationInput = { status };

  // Auto-set applied_at when status changes to 'applied'
  if (status === 'applied') {
    updates.applied_at = new Date().toISOString();
  }

  return updateApplication(id, updates);
}

/**
 * Toggle application favorite status
 */
export async function toggleApplicationFavorite(
  id: string,
  isFavorite: boolean
): Promise<ApplicationServiceResponse<JobApplication>> {
  return updateApplication(id, { is_favorite: isFavorite });
}

/**
 * Delete an application
 */
export async function deleteApplication(
  id: string,
  hard: boolean = false
): Promise<ApplicationServiceResponse<boolean>> {
  try {
    const url = hard
      ? `${API_BASE}/applications/${id}?hard=true`
      : `${API_BASE}/applications/${id}`;
    const response = await fetch(url, { method: 'DELETE' });

    if (!response.ok) {
      const json = await response.json();
      return { data: null, error: json.error || 'Failed to delete application' };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('deleteApplication error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Analyze job fit using AI
 */
export async function analyzeJobFit(
  applicationId: string
): Promise<ApplicationServiceResponse<Record<string, unknown>>> {
  try {
    const response = await fetch(`${API_BASE}/applications/${applicationId}/analyze`, {
      method: 'POST',
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to analyze job fit' };
    }

    return { data: json.fitAnalysis, error: null };
  } catch (error) {
    console.error('analyzeJobFit error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Get application statistics
 */
export async function getApplicationStats(): Promise<ApplicationServiceResponse<ApplicationStatsResponse['stats']>> {
  try {
    const response = await fetch(`${API_BASE}/applications/stats`);
    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to fetch stats' };
    }

    return { data: json.stats, error: null };
  } catch (error) {
    console.error('getApplicationStats error:', error);
    return { data: null, error: 'Network error' };
  }
}
