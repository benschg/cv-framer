'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { PhotoUpload } from '@/components/profile/photo-upload';
import { PhotoGallery } from '@/components/profile/photo-gallery';
import type { ProfilePhoto } from '@/types/api.schemas';

interface ProfilePhotosCardProps {
  photos: ProfilePhoto[];
  primaryPhoto: ProfilePhoto | null;
  loadingPhotos: boolean;
  showUpload: boolean;
  primaryPhotoUrl: string | undefined;
  userInitials: string;
  onToggleUpload: () => void;
  onPhotosUpdate: () => void;
}

export function ProfilePhotosCard({
  photos,
  primaryPhoto,
  loadingPhotos,
  showUpload,
  primaryPhotoUrl,
  userInitials,
  onToggleUpload,
  onPhotosUpdate,
}: ProfilePhotosCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Photos</CardTitle>
        <CardDescription>
          Upload multiple photos and choose which one to use for each CV
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Primary Photo */}
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={primaryPhotoUrl} />
            <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {primaryPhoto ? 'Primary Photo' : 'No photos uploaded'}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={onToggleUpload}
            >
              <Plus className="h-4 w-4 mr-2" />
              {showUpload ? 'Hide Upload' : 'Add Photo'}
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <div>
            <PhotoUpload
              onUploadComplete={() => {
                onPhotosUpdate();
                onToggleUpload();
              }}
              isPrimary={photos.length === 0}
            />
          </div>
        )}

        {/* Photo Gallery */}
        {loadingPhotos ? (
          <div className="text-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : (
          <PhotoGallery
            photos={photos}
            primaryPhoto={primaryPhoto}
            onUpdate={onPhotosUpdate}
            userInitials={userInitials}
          />
        )}
      </CardContent>
    </Card>
  );
}
