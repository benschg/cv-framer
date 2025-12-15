'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { fetchProfilePhotos, getPhotoPublicUrl } from '@/services/profile-photo.service';
import { Loader2 } from 'lucide-react';
import type { ProfilePhoto } from '@/types/api.schemas';

interface PhotoSelectorProps {
  selectedPhotoId: string | null;
  onChange: (photoId: string | null) => void;
  userInitials: string;
}

export function PhotoSelector({ selectedPhotoId, onChange, userInitials }: PhotoSelectorProps) {
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [primaryPhoto, setPrimaryPhoto] = useState<ProfilePhoto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      const result = await fetchProfilePhotos();
      if (result.data) {
        setPhotos(result.data.photos);
        setPrimaryPhoto(result.data.primaryPhoto);
      }
      setLoading(false);
    };
    loadPhotos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading photos...
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No photos available. Upload photos in your profile.
      </div>
    );
  }

  return (
    <RadioGroup
      value={selectedPhotoId || 'primary'}
      onValueChange={(value) => onChange(value === 'primary' ? null : value)}
    >
      <div className="space-y-3">
        {/* Primary Photo Option */}
        <div className="flex items-center space-x-3 border rounded-lg p-3">
          <RadioGroupItem value="primary" id="primary" />
          <Label htmlFor="primary" className="flex items-center gap-3 cursor-pointer flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={primaryPhoto ? getPhotoPublicUrl(primaryPhoto.storage_path) : undefined}
              />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Primary Photo (Default)</p>
              <p className="text-xs text-muted-foreground">
                {primaryPhoto ? primaryPhoto.filename : 'No primary photo set'}
              </p>
            </div>
          </Label>
        </div>

        {/* Other Photos */}
        {photos.filter(p => !p.is_primary).map((photo) => (
          <div key={photo.id} className="flex items-center space-x-3 border rounded-lg p-3">
            <RadioGroupItem value={photo.id} id={photo.id} />
            <Label htmlFor={photo.id} className="flex items-center gap-3 cursor-pointer flex-1">
              <Avatar className="h-12 w-12">
                <AvatarImage src={getPhotoPublicUrl(photo.storage_path)} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{photo.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {(photo.file_size / 1024).toFixed(0)} KB
                </p>
              </div>
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
}
