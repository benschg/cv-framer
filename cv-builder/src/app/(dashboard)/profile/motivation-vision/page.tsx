'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';
import { MotivationVisionForm } from '@/components/profile/motivation-vision-form';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { fetchMotivationVision, upsertMotivationVision } from '@/services/profile-career.service';
import type { ProfileMotivationVision } from '@/types/profile-career.types';
import { debounce } from '@/services/profile-career.service';

export default function MotivationVisionPage() {
  const { t } = useAppTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<ProfileMotivationVision>>({
    vision: '',
    mission: '',
    purpose: '',
    what_drives_you: '',
    why_this_field: '',
    career_goals: '',
    passions: [],
    how_passions_relate: '',
  });

  // Load existing data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data, error } = await fetchMotivationVision();

      if (data && !error) {
        setFormData({
          vision: data.vision || '',
          mission: data.mission || '',
          purpose: data.purpose || '',
          what_drives_you: data.what_drives_you || '',
          why_this_field: data.why_this_field || '',
          career_goals: data.career_goals || '',
          passions: data.passions || [],
          how_passions_relate: data.how_passions_relate || '',
        });
      }
      setLoading(false);
    }

    loadData();
  }, []);

  // Auto-save handler with debouncing
  const handleFieldChange = useCallback((field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Trigger auto-save
    setIsSaving(true);
    setSaveSuccess(false);

    const debouncedSave = debounce(
      `motivation-vision-${field}`,
      async () => {
        const { error } = await upsertMotivationVision({
          ...formData,
          [field]: value,
        });

        setIsSaving(false);

        if (!error) {
          setSaveSuccess(true);
          setTimeout(() => {
            setSaveSuccess(false);
          }, 2000);
        } else {
          console.error('Auto-save failed:', error);
        }
      },
      1000
    );

    debouncedSave();
  }, [formData]);

  if (loading) {
    return (
      <ProfilePageLayout
        title={t('profile.motivationVision.pageTitle')}
        description={t('profile.motivationVision.pageSubtitle')}
        isSaving={false}
        saveSuccess={false}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </ProfilePageLayout>
    );
  }

  return (
    <ProfilePageLayout
      title={t('profile.motivationVision.pageTitle')}
      description={t('profile.motivationVision.pageSubtitle')}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
    >
      <MotivationVisionForm
        formData={formData}
        onChange={handleFieldChange}
      />
    </ProfilePageLayout>
  );
}
