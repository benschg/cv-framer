'use client';

import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Trash2, Loader2 } from 'lucide-react';
import { setPrimaryPhoto, deleteProfilePhoto, getPhotoPublicUrl } from '@/services/profile-photo.service';
import { toast } from 'sonner';
import type { ProfilePhoto } from '@/types/api.schemas';
import { useTranslations } from '@/hooks/use-translations';

interface PhotoGalleryProps {
  photos: ProfilePhoto[];
  primaryPhoto: ProfilePhoto | null;
  onUpdate: () => void;
  userInitials: string;
}

export function PhotoGallery({ photos, primaryPhoto, onUpdate, userInitials }: PhotoGalleryProps) {
  const { t } = useTranslations('en'); // TODO: Get language from user settings context
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
    return (
      <div className="text-center text-muted-foreground py-8">
        No photos uploaded yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {photos.map((photo) => {
        const isPrimary = photo.id === primaryPhoto?.id;
        const isActioning = actioningId === photo.id;
        const publicUrl = getPhotoPublicUrl(photo.storage_path);

        return (
          <Card key={photo.id} className="relative group">
            <CardContent className="p-3">
              <div className="relative">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={publicUrl} alt={photo.filename} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>

                {isPrimary && (
                  <Badge
                    variant="default"
                    className="absolute top-0 right-0 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Primary
                  </Badge>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center gap-2">
                  {!isPrimary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetPrimary(photo.id)}
                      disabled={isActioning}
                    >
                      {isActioning ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Set Primary'
                      )}
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

              <p className="text-xs text-center text-muted-foreground mt-2 truncate">
                {photo.filename}
              </p>
              <p className="text-xs text-center text-muted-foreground">
                {(photo.file_size / 1024).toFixed(0)} KB
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
