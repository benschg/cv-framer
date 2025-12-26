'use client';

import { useCallback, useEffect, useState } from 'react';

import { BasicInfoForm } from '@/components/profile/basic-info-form';
import { CareerInfoNavigation } from '@/components/profile/career-info-navigation';
import { DefaultCvSettingsForm } from '@/components/profile/default-cv-settings-form';
import { ProfessionalLinksForm } from '@/components/profile/professional-links-form';
import { ProfilePhotosCard } from '@/components/profile/profile-photos-card';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';
import { useAuth } from '@/contexts/auth-context';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { getUserInitials, getUserLocation, getUserName, getUserPhone } from '@/lib/user-utils';
import { debounce } from '@/services/profile-career.service';
import { fetchProfilePhotos } from '@/services/profile-photo.service';
import {
  fetchUserProfile,
  updateUserProfile as updateUserProfileData,
} from '@/services/user-profile.service';
import type { ProfilePhotoWithUrl } from '@/types/api.schemas';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const { t } = useAppTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Photo state
  const [photos, setPhotos] = useState<ProfilePhotoWithUrl[]>([]);
  const [primaryPhoto, setPrimaryPhoto] = useState<ProfilePhotoWithUrl | null>(null);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  // Form state - pre-filled with user data from auth.user_metadata
  const { firstName: userFirstName, lastName: userLastName } = getUserName(user);
  const userPhone = getUserPhone(user);
  const userLocation = getUserLocation(user);

  const [formData, setFormData] = useState({
    firstName: userFirstName,
    lastName: userLastName,
    email: user?.email || '',
    phone: userPhone,
    location: userLocation,
    linkedinUrl: '',
    githubUrl: '',
    websiteUrl: '',
    defaultTagline: '',
    personalMotto: '',
  });

  // Update form when user data changes (e.g., after login)
  useEffect(() => {
    const { firstName, lastName } = getUserName(user);
    // Valid pattern: syncing form state with user prop
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((prev) => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      email: user?.email || prev.email,
      phone: getUserPhone(user) || prev.phone,
      location: getUserLocation(user) || prev.location,
    }));
  }, [user]);

  // Load photos
  const loadPhotos = async () => {
    setLoadingPhotos(true);
    const result = await fetchProfilePhotos();
    if (result.data) {
      setPhotos(result.data.photos);
      setPrimaryPhoto(result.data.primaryPhoto);
    }
    setLoadingPhotos(false);
  };

  // Load photos and profile data when user is available
  useEffect(() => {
    if (user) {
      // Valid pattern: data fetching on user change
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadPhotos();

      // Load user profile data from database
       
      fetchUserProfile().then((result) => {
        if (result.data) {
          const profile = result.data;
          setFormData((prev) => ({
            ...prev,
            linkedinUrl: profile.linkedin_url || '',
            githubUrl: profile.github_url || '',
            websiteUrl: profile.website_url || '',
            defaultTagline: profile.default_tagline || '',
            personalMotto: profile.personal_motto || '',
          }));
        }
      });
    }
  }, [user]);

  // Auto-save handler with debouncing
  const handleFieldChange = useCallback(
    (name: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Trigger auto-save
      setIsSaving(true);
      setSaveSuccess(false);

      const debouncedSave = debounce(
        `profile-${name}`,
        async () => {
          let error: string | null = null;

          // Determine which fields need to be saved where
          const authFields = ['firstName', 'lastName', 'phone', 'location'];
          const profileFields = [
            'defaultTagline',
            'personalMotto',
            'linkedinUrl',
            'githubUrl',
            'websiteUrl',
          ];

          if (authFields.includes(name)) {
            // Save to auth.users.user_metadata
            const result = await updateUserProfile({
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone,
              location: formData.location,
              [name]: value, // Include the latest value
            });
            error = result.error;
          } else if (profileFields.includes(name)) {
            // Save to user_profiles table
            const profileData: Record<string, string> = {};
            // Convert camelCase to snake_case for database fields
            const dbFieldMap: Record<string, string> = {
              defaultTagline: 'default_tagline',
              personalMotto: 'personal_motto',
              linkedinUrl: 'linkedin_url',
              githubUrl: 'github_url',
              websiteUrl: 'website_url',
            };
            profileData[dbFieldMap[name] || name] = value;

            const result = await updateUserProfileData(profileData);
            error = result.error;
          }

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
    },
    [formData, updateUserProfile]
  );

  const userInitials = getUserInitials(user);
  const primaryPhotoUrl = primaryPhoto?.signedUrl ?? user?.user_metadata?.avatar_url;

  return (
    <ProfilePageLayout
      title={t('profile.title')}
      description={t('profile.subtitle')}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
    >
      <div className="space-y-6">
        <BasicInfoForm formData={formData} onChange={handleFieldChange} />

        <ProfilePhotosCard
          photos={photos}
          primaryPhoto={primaryPhoto}
          loadingPhotos={loadingPhotos}
          primaryPhotoUrl={primaryPhotoUrl}
          userInitials={userInitials}
          onPhotosUpdate={loadPhotos}
        />

        <DefaultCvSettingsForm
          defaultTagline={formData.defaultTagline}
          personalMotto={formData.personalMotto}
          onChange={handleFieldChange}
        />

        <CareerInfoNavigation />

        <ProfessionalLinksForm formData={formData} onChange={handleFieldChange} />
      </div>
    </ProfilePageLayout>
  );
}
