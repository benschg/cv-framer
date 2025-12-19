/**
 * Hook to fetch and calculate profile completion
 */

import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import {
  calculateProfileCompletion,
  type ProfileCompletion,
  type ProfileSectionData,
} from '@/lib/profile-completion';
import {
  fetchCertifications,
  fetchEducations,
  fetchHighlights,
  fetchKeyCompetences,
  fetchMotivationVision,
  fetchProjects,
  fetchReferences,
  fetchSkillCategories,
  fetchWorkExperiences,
} from '@/services/profile-career.service';

interface UseProfileCompletionReturn {
  completion: ProfileCompletion | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfileCompletion(): UseProfileCompletionReturn {
  const { user } = useAuth();
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all profile sections in parallel
      const [
        motivationVisionResult,
        highlightsResult,
        projectsResult,
        workExperiencesResult,
        educationsResult,
        skillsResult,
        keyCompetencesResult,
        certificationsResult,
        referencesResult,
      ] = await Promise.all([
        fetchMotivationVision(),
        fetchHighlights(),
        fetchProjects(),
        fetchWorkExperiences(),
        fetchEducations(),
        fetchSkillCategories(),
        fetchKeyCompetences(),
        fetchCertifications(),
        fetchReferences(),
      ]);

      const sectionData: ProfileSectionData = {
        motivationVision: motivationVisionResult.data,
        highlights: highlightsResult.data || [],
        projects: projectsResult.data || [],
        workExperiences: workExperiencesResult.data || [],
        educations: educationsResult.data || [],
        skills: skillsResult.data || [],
        keyCompetences: keyCompetencesResult.data || [],
        certifications: certificationsResult.data || [],
        references: referencesResult.data || [],
      };

      const profileCompletion = calculateProfileCompletion(sectionData);
      setCompletion(profileCompletion);
    } catch (err) {
      console.error('Failed to fetch profile completion:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    completion,
    loading,
    error,
    refetch: fetchAllData,
  };
}
