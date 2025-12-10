import type {
  ShareLink,
  CreateShareLinkInput,
  UpdateShareLinkInput,
} from '@/types/api.schemas';

const API_BASE = '/api';

export interface ShareServiceResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Generate a unique share token
 */
function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Create a new share link for a CV
 */
export async function createShareLink(
  data: CreateShareLinkInput
): Promise<ShareServiceResponse<ShareLink>> {
  try {
    const response = await fetch(`${API_BASE}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to create share link' };
    }

    return { data: json.shareLink, error: null };
  } catch (error) {
    console.error('createShareLink error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Get share links for a CV
 */
export async function getShareLinks(
  cvId: string
): Promise<ShareServiceResponse<ShareLink[]>> {
  try {
    const response = await fetch(`${API_BASE}/share?cv_id=${cvId}`);
    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to fetch share links' };
    }

    return { data: json.shareLinks || [], error: null };
  } catch (error) {
    console.error('getShareLinks error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Delete a share link
 */
export async function deleteShareLink(
  linkId: string
): Promise<ShareServiceResponse<boolean>> {
  try {
    const response = await fetch(`${API_BASE}/share/${linkId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const json = await response.json();
      return { data: null, error: json.error || 'Failed to delete share link' };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('deleteShareLink error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Toggle share link active status or update other properties
 */
export async function updateShareLink(
  linkId: string,
  data: UpdateShareLinkInput
): Promise<ShareServiceResponse<ShareLink>> {
  try {
    const response = await fetch(`${API_BASE}/share/${linkId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to update share link' };
    }

    return { data: json.shareLink, error: null };
  } catch (error) {
    console.error('updateShareLink error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Toggle share link active status (convenience wrapper)
 */
export async function toggleShareLink(
  linkId: string,
  isActive: boolean
): Promise<ShareServiceResponse<ShareLink>> {
  return updateShareLink(linkId, { is_active: isActive });
}

/**
 * Get the full share URL
 */
export function getShareURL(token: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/s/${token}`;
  }
  return `/s/${token}`;
}

/**
 * Export unique token generator for use in API
 */
export { generateShareToken };
