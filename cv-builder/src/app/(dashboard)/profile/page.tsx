'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, Save } from 'lucide-react';
import { fetchProfilePhotos, getPhotoPublicUrl } from '@/services/profile-photo.service';
import { getUserInitials, getUserName, getUserPhone, getUserLocation } from '@/lib/user-utils';
import type { ProfilePhoto } from '@/types/api.schemas';
import { toast } from 'sonner';
import { BasicInfoForm } from '@/components/profile/basic-info-form';
import { ProfilePhotosCard } from '@/components/profile/profile-photos-card';
import { DefaultCvSettingsForm } from '@/components/profile/default-cv-settings-form';
import { ProfessionalLinksForm } from '@/components/profile/professional-links-form';
import { CareerInfoNavigation } from '@/components/profile/career-info-navigation';
import { useTranslations } from '@/hooks/use-translations';
import { useUserPreferences } from '@/contexts/user-preferences-context';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const { language } = useUserPreferences();
  const { t } = useTranslations(language);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Photo state
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [primaryPhoto, setPrimaryPhoto] = useState<ProfilePhoto | null>(null);
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
  });

  // Update form when user data changes (e.g., after login)
  useEffect(() => {
    const { firstName, lastName } = getUserName(user);
    setFormData(prev => ({
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

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setIsSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Save basic info to auth.user_metadata
    const { error } = await updateUserProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      location: formData.location,
    });

    if (error) {
      toast.error(`${t('profile.saveError')}: ${error}`);
      setIsLoading(false);
      return;
    }

    // TODO: Save professional links and default tagline to a separate table if needed

    setIsLoading(false);
    setIsSaved(true);
    toast.success(t('profile.saveSuccess'));
  };

  const userInitials = getUserInitials(user);
  const primaryPhotoUrl = primaryPhoto
    ? getPhotoPublicUrl(primaryPhoto.storage_path)
    : user?.user_metadata?.avatar_url;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('profile.title')}</h1>
        <p className="text-muted-foreground">
          {t('profile.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInfoForm formData={formData} onChange={handleChange} />

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
          onChange={handleChange}
        />

        <CareerInfoNavigation />

        <ProfessionalLinksForm formData={formData} onChange={handleChange} />

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          {isSaved && (
            <p className="text-sm text-green-600 self-center">
              {t('profile.savedMessage')}
            </p>
          )}
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('profile.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('profile.saveButton')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
