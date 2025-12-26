/**
 * Centralized hook for accessing all profile data and completion tracking
 * Single source of truth - use this instead of individual fetch hooks
 */

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import {
  calculateOverallCompletion,
  fetchAllProfileData,
  getSectionCompletion,
  getSectionCompletionByHref,
  PROFILE_SECTIONS_METADATA,
  type ProfileDataResponse,
  type ProfileSectionKey,
} from '@/services/profile-data.service';

export interface UseProfileDataReturn {
  /** All profile section data */
  data: ProfileDataResponse | null;

  /** Loading state */
  loading: boolean;

  /** Error message if fetch failed */
  error: string | null;

  /** Refetch all data */
  refetch: () => Promise<void>;

  /** Overall completion percentage (0-100) */
  overallCompletion: number;

  /** Number of completed sections */
  completedSections: number;

  /** Total number of sections */
  totalSections: number;

  /** Whether all required sections are complete */
  requiredComplete: boolean;

  /** Get completion status for a specific section */
  getSectionStatus: (key: ProfileSectionKey) => {
    isComplete: boolean;
    count: number;
    percentage: number;
  };

  /** Get completion status by href (useful for navigation) */
  getStatusByHref: (href: string) => {
    isComplete: boolean;
    count: number;
  } | null;

  /** Section metadata for reference */
  sectionMetadata: typeof PROFILE_SECTIONS_METADATA;
}

/**
 * Centralized hook for all profile data access
 *
 * @example
 * ```tsx
 * const { data, loading, overallCompletion, getSectionStatus } = useProfileData();
 *
 * // Check work experience completion
 * const workExpStatus = getSectionStatus('workExperiences');
 * console.log(`Work Experience: ${workExpStatus.count} entries, ${workExpStatus.isComplete ? 'Complete' : 'Incomplete'}`);
 *
 * // Access raw data
 * const workExperiences = data?.sections.workExperiences.data || [];
 * ```
 */
export function useProfileData(): UseProfileDataReturn {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const result = await fetchAllProfileData();

      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result.data);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const result = await fetchAllProfileData();

    if (result.error) {
      setError(result.error);
      setData(null);
    } else {
      setData(result.data);
    }

    setLoading(false);
  }, [user]);

  // Calculate completion metrics
  const completion = data
    ? calculateOverallCompletion(data)
    : {
        overallPercentage: 0,
        completedSections: 0,
        totalSections: 0,
        requiredComplete: false,
        sections: [],
      };

  // Helper function to get section status
  const getSectionStatus = useCallback(
    (key: ProfileSectionKey) => {
      if (!data) {
        return { isComplete: false, count: 0, percentage: 0 };
      }
      return getSectionCompletion(key, data);
    },
    [data]
  );

  // Helper function to get status by href
  const getStatusByHref = useCallback(
    (href: string) => {
      if (!data) return null;
      return getSectionCompletionByHref(href, data);
    },
    [data]
  );

  return {
    data,
    loading,
    error,
    refetch,
    overallCompletion: completion.overallPercentage,
    completedSections: completion.completedSections,
    totalSections: completion.totalSections,
    requiredComplete: completion.requiredComplete,
    getSectionStatus,
    getStatusByHref,
    sectionMetadata: PROFILE_SECTIONS_METADATA,
  };
}
