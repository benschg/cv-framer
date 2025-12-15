'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, Save } from 'lucide-react';
import { fetchProfilePhotos, getPhotoPublicUrl } from '@/services/profile-photo.service';
import { getUserInitials, getUserName } from '@/lib/user-utils';
import type { ProfilePhoto } from '@/types/api.schemas';
import { BasicInfoForm } from '@/components/profile/basic-info-form';
import { ProfilePhotosCard } from '@/components/profile/profile-photos-card';
import { DefaultCvSettingsForm } from '@/components/profile/default-cv-settings-form';
import { ProfessionalLinksForm } from '@/components/profile/professional-links-form';
import { CareerInfoNavigation } from '@/components/profile/career-info-navigation';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Photo state
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [primaryPhoto, setPrimaryPhoto] = useState<ProfilePhoto | null>(null);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  // Form state - pre-filled with user data
  const { firstName: userFirstName, lastName: userLastName } = getUserName(user);
  const [formData, setFormData] = useState({
    firstName: userFirstName,
    lastName: userLastName,
    email: user?.email || '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    websiteUrl: '',
    defaultTagline: '',
  });

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

    // TODO: Save to Supabase user_profiles table
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    setIsSaved(true);
  };

  const userInitials = getUserInitials(user);
  const primaryPhotoUrl = primaryPhoto
    ? getPhotoPublicUrl(primaryPhoto.storage_path)
    : user?.user_metadata?.avatar_url;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and professional details
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

        <ProfessionalLinksForm formData={formData} onChange={handleChange} />

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          {isSaved && (
            <p className="text-sm text-green-600 self-center">
              Changes saved successfully!
            </p>
          )}
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      <CareerInfoNavigation />
    </div>
  );
}
