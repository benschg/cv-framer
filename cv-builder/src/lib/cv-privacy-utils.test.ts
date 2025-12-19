import { describe, expect, it } from 'vitest';

import type { UserProfile } from '@/types/cv.types';

import {
  getDisplayName,
  shouldShowContactInfo,
  shouldShowLocation,
  shouldShowPrivacyBadge,
} from './cv-privacy-utils';

describe('getDisplayName', () => {
  const mockProfile: UserProfile = {
    id: '123',
    user_id: '456',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    preferred_language: 'en',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  describe('with "full" privacy level', () => {
    it('should return "Anonymous"', () => {
      expect(getDisplayName('full', mockProfile)).toBe('Anonymous');
    });

    it('should return "Anonymous" even without profile', () => {
      expect(getDisplayName('full', undefined)).toBe('Anonymous');
    });
  });

  describe('with "personal" privacy level', () => {
    it('should return full name from profile', () => {
      expect(getDisplayName('personal', mockProfile)).toBe('John Doe');
    });

    it('should return first name only if no last name', () => {
      const profileNoLastName = { ...mockProfile, last_name: undefined };
      expect(getDisplayName('personal', profileNoLastName)).toBe('John');
    });

    it('should return last name only if no first name', () => {
      const profileNoFirstName = { ...mockProfile, first_name: undefined };
      expect(getDisplayName('personal', profileNoFirstName)).toBe('Doe');
    });

    it('should return "Anonymous" if no name', () => {
      const profileNoName = { ...mockProfile, first_name: undefined, last_name: undefined };
      expect(getDisplayName('personal', profileNoName)).toBe('Anonymous');
    });

    it('should return "Anonymous" if empty strings', () => {
      const profileEmptyName = { ...mockProfile, first_name: '', last_name: '' };
      expect(getDisplayName('personal', profileEmptyName)).toBe('Anonymous');
    });

    it('should return "Anonymous" if no profile', () => {
      expect(getDisplayName('personal', undefined)).toBe('Anonymous');
    });
  });

  describe('with "none" privacy level', () => {
    it('should return full name from profile', () => {
      expect(getDisplayName('none', mockProfile)).toBe('John Doe');
    });

    it('should return "Anonymous" if no profile', () => {
      expect(getDisplayName('none', undefined)).toBe('Anonymous');
    });
  });
});

describe('shouldShowContactInfo', () => {
  it('should return true for "none" privacy level', () => {
    expect(shouldShowContactInfo('none')).toBe(true);
  });

  it('should return false for "personal" privacy level', () => {
    expect(shouldShowContactInfo('personal')).toBe(false);
  });

  it('should return false for "full" privacy level', () => {
    expect(shouldShowContactInfo('full')).toBe(false);
  });
});

describe('shouldShowLocation', () => {
  it('should return true for "none" privacy level', () => {
    expect(shouldShowLocation('none')).toBe(true);
  });

  it('should return true for "personal" privacy level', () => {
    expect(shouldShowLocation('personal')).toBe(true);
  });

  it('should return false for "full" privacy level', () => {
    expect(shouldShowLocation('full')).toBe(false);
  });
});

describe('shouldShowPrivacyBadge', () => {
  it('should return true for "full" privacy level', () => {
    expect(shouldShowPrivacyBadge('full')).toBe(true);
  });

  it('should return false for "personal" privacy level', () => {
    expect(shouldShowPrivacyBadge('personal')).toBe(false);
  });

  it('should return false for "none" privacy level', () => {
    expect(shouldShowPrivacyBadge('none')).toBe(false);
  });
});
