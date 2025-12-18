'use client';

import { Check, Loader2,Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback,AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUserPreferences } from '@/contexts/user-preferences-context';
import { useTranslations } from '@/hooks/use-translations';
import {
  deleteProfilePhoto,
  getPhotoPublicUrl,
  setPrimaryPhoto,
} from '@/services/profile-photo.service';
import type { ProfilePhoto } from '@/types/api.schemas';

interface PhotoGalleryProps {
  photos: ProfilePhoto[];
  primaryPhoto: ProfilePhoto | null;
  onUpdate: () => void;
  userInitials: string;
}

export function PhotoGallery({ photos, primaryPhoto, onUpdate, userInitials }: PhotoGalleryProps) {
  const { language } = useUserPreferences();
  const { t } = useTranslations(language);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const handleSetPrimary = async (photoId: string) => {
    setActioningId(photoId);
    const result = await setPrimaryPhoto(photoId);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('profile.photoGallery.primaryUpdated'));
      onUpdate();
    }

    setActioningId(null);
  };

  const handleDelete = async (photo: ProfilePhoto) => {
    if (photos.length === 1) {
      toast.error(t('profile.photoGallery.cannotDeleteOnly'));
      return;
    }

    if (!confirm(`Delete ${photo.filename}?`)) {
      return;
    }

    setActioningId(photo.id);
    const result = await deleteProfilePhoto(photo.id);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('profile.photoGallery.photoDeleted'));
      onUpdate();
    }

    setActioningId(null);
  };

  if (photos.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No photos uploaded yet</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {photos.map((photo) => {
        const isPrimary = photo.id === primaryPhoto?.id;
        const isActioning = actioningId === photo.id;
        const publicUrl = getPhotoPublicUrl(photo.storage_path);

        return (
          <Card key={photo.id} className="group relative">
            <CardContent className="p-3">
              <div className="relative">
                <Avatar className="mx-auto h-24 w-24">
                  <AvatarImage src={publicUrl} alt={photo.filename} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>

                {isPrimary && (
                  <Badge variant="default" className="absolute right-0 top-0 text-xs">
                    <Check className="mr-1 h-3 w-3" />
                    Primary
                  </Badge>
                )}

                <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  {!isPrimary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetPrimary(photo.id)}
                      disabled={isActioning}
                    >
                      {isActioning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set Primary'}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(photo)}
                    disabled={isActioning}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-2 truncate text-center text-xs text-muted-foreground">
                {photo.filename}
              </p>
              <p className="text-center text-xs text-muted-foreground">
                {(photo.file_size / 1024).toFixed(0)} KB
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
