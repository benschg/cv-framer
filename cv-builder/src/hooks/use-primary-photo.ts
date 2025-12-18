import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { fetchProfilePhotos } from '@/services/profile-photo.service';
import type { ProfilePhotoWithUrl } from '@/types/api.schemas';

/**
 * Hook to fetch and provide the primary profile photo with signed URL.
 * Handles loading state, falls back to OAuth avatar if no photo.
 */
export function usePrimaryPhoto() {
  const { user } = useAuth();
  const [primaryPhoto, setPrimaryPhoto] = useState<ProfilePhotoWithUrl | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrimaryPhoto = async () => {
      setLoading(true);
      const result = await fetchProfilePhotos();
      if (result.data?.primaryPhoto) {
        setPrimaryPhoto(result.data.primaryPhoto);
      }
      setLoading(false);
    };

    if (user) {
      loadPrimaryPhoto();
    } else {
      // Valid pattern: setting loading false when no user to fetch for
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [user]);

  const avatarUrl = useMemo(
    () => primaryPhoto?.signedUrl ?? user?.user_metadata?.avatar_url,
    [primaryPhoto, user?.user_metadata?.avatar_url]
  );

  return {
    primaryPhoto,
    avatarUrl,
    loading,
  };
}
