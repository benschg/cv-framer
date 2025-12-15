'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, UserX } from 'lucide-react';
import { CVPreview } from './cv-preview';
import { getPhotoPublicUrl } from '@/services/profile-photo.service';
import type { CVContent, DisplaySettings } from '@/types/cv.types';
import type { ProfilePhoto } from '@/types/api.schemas';
import type { CVWorkExperienceWithSelection } from '@/types/profile-career.types';

interface CVPreviewSectionProps {
  content: CVContent;
  language: 'en' | 'de';
  displaySettings?: Partial<DisplaySettings> | null;
  photoUrl: string | null;
  userInitials: string;
  photos: ProfilePhoto[];
  primaryPhoto: ProfilePhoto | null;
  onPhotoSelect: (photoId: string | null) => void;
  onFormatChange: (format: 'A4' | 'Letter') => void;
  workExperiences?: CVWorkExperienceWithSelection[];
}

export function CVPreviewSection({
  content,
  language,
  displaySettings,
  photoUrl,
  userInitials,
  photos,
  primaryPhoto,
  onPhotoSelect,
  onFormatChange,
  workExperiences,
}: CVPreviewSectionProps) {
  const renderPhotoPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="cursor-pointer hover:opacity-80 transition-opacity"
          title="Change photo"
        >
          <Avatar className="h-24 w-24 flex-shrink-0">
            <AvatarImage src={photoUrl || undefined} alt={userInitials} />
            <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="max-h-[400px] overflow-y-auto">
          {/* No Photo Option */}
          <button
            onClick={() => onPhotoSelect('none')}
            className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors ${
              content.selected_photo_id === 'none' ? 'bg-accent' : ''
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
            {content.selected_photo_id === 'none' && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </button>

          {/* Separator */}
          <div className="border-t my-1" />

          {/* Primary Photo Option */}
          <button
            onClick={() => onPhotoSelect(null)}
            className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors ${
              !content.selected_photo_id || content.selected_photo_id === primaryPhoto?.id ? 'bg-accent' : ''
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
            {(!content.selected_photo_id || content.selected_photo_id === primaryPhoto?.id) && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </button>

          {/* Separator */}
          {photos.filter(p => !p.is_primary).length > 0 && (
            <div className="border-t my-1" />
          )}

          {/* Other Photos */}
          {photos.filter(p => !p.is_primary).map((photo) => {
            const isSelected = content.selected_photo_id === photo.id;
            return (
              <button
                key={photo.id}
                onClick={() => onPhotoSelect(photo.id)}
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
  );

  return (
    <Card id="preview-section">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Preview
              <Badge variant="outline" className="font-normal">Live</Badge>
            </CardTitle>
            <CardDescription>
              This is how your CV will look when exported
            </CardDescription>
          </div>
          <Select
            value={displaySettings?.format || 'A4'}
            onValueChange={(value) => onFormatChange(value as 'A4' | 'Letter')}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="Letter">Letter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <CVPreview
          content={content}
          language={language}
          settings={displaySettings}
          photoUrl={photoUrl}
          userInitials={userInitials}
          photoElement={renderPhotoPopover()}
          workExperiences={workExperiences}
        />
      </CardContent>
    </Card>
  );
}
