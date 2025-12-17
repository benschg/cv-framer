'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, UserX, Upload } from 'lucide-react';
import { fetchProfilePhotos, getPhotoPublicUrl } from '@/services/profile-photo.service';
import { Loader2 } from 'lucide-react';
import type { ProfilePhoto } from '@/types/api.schemas';

interface PhotoSelectorProps {
  selectedPhotoId: string | null;
  onChange: (photoId: string | null) => void;
  userInitials: string;
  /** Optional: Control popover open state externally */
  open?: boolean;
  /** Optional: Callback when popover open state changes */
  onOpenChange?: (open: boolean) => void;
}

export function PhotoSelector({ selectedPhotoId, onChange, userInitials, open: externalOpen, onOpenChange: externalOnOpenChange }: PhotoSelectorProps) {
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [primaryPhoto, setPrimaryPhoto] = useState<ProfilePhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

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
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              <Upload className="h-6 w-6 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">No photos available</p>
            <p className="text-xs text-muted-foreground">
              Upload photos to use them in your CV
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/profile">
            Upload Photos
          </Link>
        </Button>
      </div>
    );
  }

  // Determine which photo to display
  const isNoPhoto = selectedPhotoId === 'none';
  const selectedPhoto = isNoPhoto
    ? null
    : selectedPhotoId
    ? photos.find(p => p.id === selectedPhotoId) || primaryPhoto
    : primaryPhoto;

  const selectedPhotoUrl = selectedPhoto
    ? getPhotoPublicUrl(selectedPhoto.storage_path)
    : undefined;

  const isUsingPrimary = !selectedPhotoId || selectedPhotoId === primaryPhoto?.id;

  return (
    <div className="flex items-center gap-4">
      {/* Current selection display */}
      <Avatar className="h-16 w-16">
        <AvatarImage src={selectedPhotoUrl} />
        <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">
          {isNoPhoto
            ? 'No Photo'
            : isUsingPrimary
            ? 'Primary Photo (Default)'
            : selectedPhoto?.filename}
        </p>
        <p className="text-xs text-muted-foreground">
          {isNoPhoto
            ? 'CV will be generated without a photo'
            : isUsingPrimary
            ? 'Using your default profile photo'
            : 'Custom photo for this CV'}
        </p>
      </div>

      {/* Photo picker popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            Change Photo
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="max-h-[400px] overflow-y-auto">
            {/* No Photo Option */}
            <button
              onClick={() => {
                onChange('none');
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors ${
                isNoPhoto ? 'bg-accent' : ''
              }`}
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  <UserX className="h-6 w-6 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">No Photo</p>
                <p className="text-xs text-muted-foreground">
                  Generate CV without a photo
                </p>
              </div>
              {isNoPhoto && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>

            {/* Separator */}
            <div className="border-t my-1" />

            {/* Primary Photo Option */}
            <button
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors ${
                isUsingPrimary ? 'bg-accent' : ''
              }`}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={primaryPhoto ? getPhotoPublicUrl(primaryPhoto.storage_path) : undefined}
                />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">Primary Photo (Default)</p>
                <p className="text-xs text-muted-foreground">
                  {primaryPhoto ? primaryPhoto.filename : 'No primary photo set'}
                </p>
              </div>
              {isUsingPrimary && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>

            {/* Separator */}
            {photos.filter(p => !p.is_primary).length > 0 && (
              <div className="border-t my-1" />
            )}

            {/* Other Photos */}
            {photos.filter(p => !p.is_primary).map((photo) => {
              const isSelected = selectedPhotoId === photo.id;
              return (
                <button
                  key={photo.id}
                  onClick={() => {
                    onChange(photo.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors ${
                    isSelected ? 'bg-accent' : ''
                  }`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getPhotoPublicUrl(photo.storage_path)} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{photo.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {(photo.file_size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
