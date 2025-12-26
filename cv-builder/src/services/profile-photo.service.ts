import type { GetProfilePhotosResponse, ProfilePhotoWithUrl } from '@/types/api.schemas';

export async function fetchProfilePhotos(): Promise<{
  data?: GetProfilePhotosResponse;
  error?: string;
}> {
  try {
    const response = await fetch('/api/profile-photos', {
      cache: 'no-store',
    });
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch photos' };
    }

    return { data };
  } catch {
    return { error: 'Network error' };
  }
}

export async function uploadProfilePhoto(
  file: File,
  options: {
    isPrimary?: boolean;
    width?: number;
    height?: number;
  } = {}
): Promise<{
  data?: { photo: ProfilePhotoWithUrl };
  error?: string;
}> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (options.isPrimary) formData.append('is_primary', 'true');
    if (options.width) formData.append('width', options.width.toString());
    if (options.height) formData.append('height', options.height.toString());

    const response = await fetch('/api/profile-photos/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Upload failed' };
    }

    return { data };
  } catch {
    return { error: 'Network error' };
  }
}

export async function setPrimaryPhoto(photoId: string): Promise<{
  data?: { success: boolean };
  error?: string;
}> {
  try {
    const response = await fetch(`/api/profile-photos/${photoId}/set-primary`, {
      method: 'PATCH',
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to set primary' };
    }

    return { data };
  } catch {
    return { error: 'Network error' };
  }
}

export async function deleteProfilePhoto(photoId: string): Promise<{
  data?: { success: boolean };
  error?: string;
}> {
  try {
    const response = await fetch(`/api/profile-photos/${photoId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to delete photo' };
    }

    return { data };
  } catch {
    return { error: 'Network error' };
  }
}
