import type { ShareLink, UserProfile } from '@/types/cv.types';

/**
 * Get the display name based on privacy level
 */
export function getDisplayName(
  privacyLevel: ShareLink['privacy_level'],
  userProfile?: UserProfile
): string {
  if (privacyLevel !== 'full' && userProfile) {
    const name = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
    return name || 'Anonymous';
  }
  return 'Anonymous';
}

/**
 * Check if contact information should be shown based on privacy level
 */
export function shouldShowContactInfo(privacyLevel: ShareLink['privacy_level']): boolean {
  return privacyLevel === 'none';
}

/**
 * Check if location should be shown based on privacy level
 */
export function shouldShowLocation(privacyLevel: ShareLink['privacy_level']): boolean {
  return privacyLevel === 'none' || privacyLevel === 'personal';
}

/**
 * Check if privacy badge should be shown
 */
export function shouldShowPrivacyBadge(privacyLevel: ShareLink['privacy_level']): boolean {
  return privacyLevel === 'full';
}
