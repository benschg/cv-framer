'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, UserX, Minus, Plus } from 'lucide-react';
import { CVPreviewMultiPage } from './cv-preview-multi-page';
import { getPhotoPublicUrl } from '@/services/profile-photo.service';
import type { CVContent, DisplaySettings, UserProfile } from '@/types/cv.types';
import type { ProfilePhoto } from '@/types/api.schemas';
import type { CVWorkExperienceWithSelection, CVEducationWithSelection, CVSkillCategoryWithSelection, CVKeyCompetenceWithSelection } from '@/types/profile-career.types';

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
  onPageBreakToggle: (sectionId: string) => void;
  workExperiences?: CVWorkExperienceWithSelection[];
  educations?: CVEducationWithSelection[];
  skillCategories?: CVSkillCategoryWithSelection[];
  keyCompetences?: CVKeyCompetenceWithSelection[];
  userProfile?: UserProfile;
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
  onPageBreakToggle,
  workExperiences,
  educations,
  skillCategories,
  keyCompetences,
  userProfile,
}: CVPreviewSectionProps) {
  const [zoomMode, setZoomMode] = useState<'auto' | number>('auto');
  const [calculatedZoom, setCalculatedZoom] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Calculate auto zoom based on container width
  useEffect(() => {
    if (zoomMode !== 'auto') return;

    const calculateZoom = () => {
      if (!containerRef.current || !previewRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      // A4 width is 210mm, convert to pixels at 96 DPI (210mm * 96/25.4 ≈ 794px)
      const previewWidth = 794;

      // Calculate zoom to fit, with some padding
      const padding = 32; // 16px padding on each side
      const availableWidth = containerWidth - padding;
      const autoZoom = Math.floor((availableWidth / previewWidth) * 100);

      // Clamp between 30% and 100%
      const clampedZoom = Math.min(100, Math.max(30, autoZoom));
      setCalculatedZoom(clampedZoom);
    };

    calculateZoom();

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(calculateZoom);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [zoomMode]);

  const effectiveZoom = zoomMode === 'auto' ? calculatedZoom : zoomMode;

  const handleZoomIn = () => {
    const newZoom = typeof zoomMode === 'number'
      ? Math.min(zoomMode + 10, 200)
      : Math.min(calculatedZoom + 10, 200);
    setZoomMode(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = typeof zoomMode === 'number'
      ? Math.max(zoomMode - 10, 30)
      : Math.max(calculatedZoom - 10, 30);
    setZoomMode(newZoom);
  };

  const handleResetZoom = () => {
    setZoomMode('auto');
  };

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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              Preview
              <Badge variant="outline" className="font-normal">Live</Badge>
            </CardTitle>
            <CardDescription>
              This is how your CV will look when exported
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomOut}
                disabled={effectiveZoom <= 30}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <button
                onClick={handleResetZoom}
                className="text-sm font-medium px-2 min-w-[3.5rem] text-center hover:bg-accent rounded transition-colors"
                title="Click to reset to auto"
              >
                {zoomMode === 'auto' ? (
                  <span className="text-muted-foreground">
                    {calculatedZoom}%
                  </span>
                ) : (
                  `${effectiveZoom}%`
                )}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomIn}
                disabled={effectiveZoom >= 200}
              >
                <Plus className="h-4 w-4" />
              </Button>
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
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="overflow-y-auto overflow-x-hidden">
          <div
            ref={previewRef}
            style={{
              transform: `scale(${effectiveZoom / 100})`,
              transformOrigin: 'top left',
              width: `${100 / (effectiveZoom / 100)}%`,
            }}
          >
            <CVPreviewMultiPage
              content={content}
              language={language}
              settings={displaySettings}
              photoUrl={photoUrl}
              userInitials={userInitials}
              photoElement={renderPhotoPopover()}
              workExperiences={workExperiences}
              educations={educations}
              skillCategories={skillCategories}
              keyCompetences={keyCompetences}
              userProfile={userProfile}
              onPageBreakToggle={onPageBreakToggle}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
