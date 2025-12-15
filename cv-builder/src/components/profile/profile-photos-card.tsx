'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ChevronDown } from 'lucide-react';
import { PhotoUpload } from '@/components/profile/photo-upload';
import { PhotoGallery } from '@/components/profile/photo-gallery';
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
        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-4">
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-4 flex-shrink-0">
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
            <div className="flex-1 relative">
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
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
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
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {primaryPhoto ? 'Primary' : 'No photo'}
                </p>
              </div>
              <div className="flex-1">
                <PhotoUpload
                  onUploadComplete={onPhotosUpdate}
                  isPrimary={photos.length === 0}
                />
              </div>
            </div>

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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
