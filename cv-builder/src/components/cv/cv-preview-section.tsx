'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus } from 'lucide-react';
import { CVDocument } from './cv-document';
import type { CVContent, DisplaySettings, UserProfile } from '@/types/cv.types';
import type { CVWorkExperienceWithSelection, CVEducationWithSelection, CVSkillCategoryWithSelection, CVKeyCompetenceWithSelection } from '@/types/profile-career.types';

interface CVPreviewSectionProps {
  content: CVContent;
  language: 'en' | 'de';
  displaySettings?: Partial<DisplaySettings> | null;
  photoUrl: string | null;
  onFormatChange: (format: 'A4' | 'Letter') => void;
  onPageBreakToggle: (sectionId: string) => void;
  workExperiences?: CVWorkExperienceWithSelection[];
  educations?: CVEducationWithSelection[];
  skillCategories?: CVSkillCategoryWithSelection[];
  keyCompetences?: CVKeyCompetenceWithSelection[];
  userProfile?: UserProfile;
}

export interface CVPreviewSectionHandle {
  getPreviewHTML: () => string | null;
}

export const CVPreviewSection = forwardRef<CVPreviewSectionHandle, CVPreviewSectionProps>(function CVPreviewSection({
  content,
  language,
  displaySettings,
  photoUrl,
  onFormatChange,
  onPageBreakToggle,
  workExperiences,
  educations,
  skillCategories,
  keyCompetences,
  userProfile,
}, ref) {
  const [zoomMode, setZoomMode] = useState<'auto' | number>('auto');
  const [calculatedZoom, setCalculatedZoom] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Expose getPreviewHTML to parent
  useImperativeHandle(ref, () => ({
    getPreviewHTML: () => previewRef.current?.outerHTML ?? null,
  }));

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
        <div ref={containerRef} className="overflow-y-auto overflow-x-visible -mr-6 pr-6">
          <div ref={previewRef}>
            <CVDocument
              content={content}
              language={language}
              settings={displaySettings}
              photoUrl={photoUrl}
              workExperiences={workExperiences}
              educations={educations}
              skillCategories={skillCategories}
              keyCompetences={keyCompetences}
              userProfile={userProfile}
              zoom={zoomMode === 'auto' ? 0 : effectiveZoom / 100}
              onPageBreakToggle={onPageBreakToggle}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
