import type { User } from '@supabase/supabase-js';

/**
 * Generate user initials from user data
 * Priority: full_name -> email -> fallback
 */
export function getUserInitials(user: User | null | undefined, fallback: string = 'U'): string {
  if (!user) return fallback;

  // Try to get initials from full_name
  if (user.user_metadata?.full_name) {
    const names = user.user_metadata.full_name.trim().split(/\s+/);
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    if (names.length === 1 && names[0].length > 0) {
      return names[0].charAt(0).toUpperCase();
    }
  }

  // Fall back to email first letter
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }

  return fallback;
}

/**
 * Get first and last name from user
 */
export function getUserName(user: User | null | undefined): { firstName: string; lastName: string } {
  if (!user?.user_metadata) {
    return { firstName: '', lastName: '' };
  }

  // Prefer explicit first_name/last_name fields
  if (user.user_metadata.first_name || user.user_metadata.last_name) {
    return {
      firstName: user.user_metadata.first_name || '',
      lastName: user.user_metadata.last_name || '',
    };
  }

  // Fall back to parsing full_name
  if (user.user_metadata.full_name) {
    const names = user.user_metadata.full_name.trim().split(/\s+/);
    return {
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
    };
  }

  return { firstName: '', lastName: '' };
}

/**
 * Get phone number from user metadata
 */
export function getUserPhone(user: User | null | undefined): string {
  return user?.user_metadata?.phone || '';
}

/**
 * Get location from user metadata
 */
export function getUserLocation(user: User | null | undefined): string {
  return user?.user_metadata?.location || '';
}

/**
 * Get display name for user
 * Priority: full_name -> email username -> fallback
 */
export function getDisplayName(user: User | null | undefined, fallback: string = 'User'): string {
  if (!user) return fallback;

  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }

  if (user.email) {
    return user.email.split('@')[0];
  }

  return fallback;
}
