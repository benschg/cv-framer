export interface UserProfileData {
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  portfolio_url?: string;
  default_tagline?: string;
  personal_motto?: string;
  preferred_language?: string;
}

export interface UserProfile extends UserProfileData {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileServiceResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetch the current user's profile
 */
export async function fetchUserProfile(): Promise<UserProfileServiceResponse<UserProfile>> {
  try {
    const response = await fetch('/api/user-profile', {
      cache: 'no-store',
    });
    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to fetch user profile' };
    }

    return { data: json.profile, error: null };
  } catch (error) {
    console.error('fetchUserProfile error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(
  data: UserProfileData
): Promise<UserProfileServiceResponse<UserProfile>> {
  try {
    const response = await fetch('/api/user-profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to update user profile' };
    }

    return { data: json.profile, error: null };
  } catch (error) {
    console.error('updateUserProfile error:', error);
    return { data: null, error: 'Network error' };
  }
}
