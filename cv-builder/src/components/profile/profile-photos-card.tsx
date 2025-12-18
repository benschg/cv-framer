'use client';

import { ChevronDown,Loader2 } from 'lucide-react';
import { useState } from 'react';

import { PhotoGallery } from '@/components/profile/photo-gallery';
import { PhotoUpload } from '@/components/profile/photo-upload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { ProfilePhoto } from '@/types/api.schemas';

interface ProfilePhotosCardProps {
  photos: ProfilePhoto[];
  primaryPhoto: ProfilePhoto | null;
  loadingPhotos: boolean;
  primaryPhotoUrl: string | undefined;
  userInitials: string;
  onPhotosUpdate: () => void;
}

export function ProfilePhotosCard({
  photos,
  primaryPhoto,
  loadingPhotos,
  primaryPhotoUrl,
  userInitials,
  onPhotosUpdate,
}: ProfilePhotosCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="cursor-pointer transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-4">
            <CollapsibleTrigger asChild>
              <div className="flex flex-shrink-0 items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={primaryPhotoUrl} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Profile Photos</CardTitle>
                  <CardDescription>
                    {primaryPhoto ? 'Click to manage' : 'No photos uploaded'}
                  </CardDescription>
                </div>
              </div>
            </CollapsibleTrigger>
            <div className="relative flex-1">
              <div className={isOpen ? 'opacity-0' : ''}>
                <PhotoUpload
                  onUploadComplete={onPhotosUpdate}
                  isPrimary={photos.length === 0}
                  compact
                />
              </div>
              {isOpen && (
                <CollapsibleTrigger asChild>
                  <div className="absolute inset-0 cursor-pointer" />
                </CollapsibleTrigger>
              )}
            </div>
            <CollapsibleTrigger asChild>
              <ChevronDown
                className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Primary Photo and Upload Area */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={primaryPhotoUrl} />
                  <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                </Avatar>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {primaryPhoto ? 'Primary' : 'No photo'}
                </p>
              </div>
              <div className="flex-1">
                <PhotoUpload onUploadComplete={onPhotosUpdate} isPrimary={photos.length === 0} />
              </div>
            </div>

            {/* Photo Gallery */}
            {loadingPhotos ? (
              <div className="py-4 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
