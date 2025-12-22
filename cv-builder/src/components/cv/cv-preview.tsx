'use client';

import { forwardRef } from 'react';

import type { CVContent, DisplaySettings, UserProfile } from '@/types/cv.types';
import type { CVMainSection, CVSidebarSection } from '@/types/cv-layout.types';
import type {
  CVEducationWithSelection,
  CVKeyCompetenceWithSelection,
  CVSkillCategoryWithSelection,
  CVWorkExperienceWithSelection,
} from '@/types/profile-career.types';

import { CVDocument } from './cv-document';
import type { PhotoOption, PhotoShape, PhotoSize } from './cv-sidebar-section-wrapper';

export interface CVPreviewProps {
  content: CVContent;
  language: 'en' | 'de';
  displaySettings?: Partial<DisplaySettings> | null;
  photoUrl: string | null;
  workExperiences?: CVWorkExperienceWithSelection[];
  educations?: CVEducationWithSelection[];
  skillCategories?: CVSkillCategoryWithSelection[];
  keyCompetences?: CVKeyCompetenceWithSelection[];
  userProfile?: UserProfile;
  /** Zoom level (0-1 scale, e.g., 0.5 = 50%) */
  zoom?: number;
  /** Enable interactive section editing */
  isInteractive?: boolean;
  /** Callback when page break is toggled */
  onPageBreakToggle?: (sectionId: string) => void;
  /** Callback when a section is moved */
  onSectionMove?: (pageIndex: number, fromIndex: number, toIndex: number) => void;
  /** Callback when section visibility is toggled */
  onSectionToggleVisibility?: (sectionType: CVMainSection) => void;
  /** Callback when page properties is requested */
  onPageProperties?: (pageIndex: number) => void;
  /** Callback when a sidebar section is moved */
  onSidebarSectionMove?: (pageIndex: number, fromIndex: number, toIndex: number) => void;
  /** Callback when sidebar section visibility is toggled */
  onSidebarSectionToggleVisibility?: (sectionType: CVSidebarSection) => void;
  /** Photo options for the context menu submenu */
  photoOptions?: PhotoOption[];
  /** Currently selected photo ID */
  selectedPhotoId?: string | null;
  /** Callback when a photo is selected */
  onPhotoSelect?: (photoId: string | null) => void;
  /** User initials for avatar fallback */
  userInitials?: string;
  /** Current photo size */
  photoSize?: PhotoSize;
  /** Callback when photo size is changed */
  onPhotoSizeChange?: (size: PhotoSize) => void;
  /** Current photo shape */
  photoShape?: PhotoShape;
  /** Callback when photo shape is changed */
  onPhotoShapeChange?: (shape: PhotoShape) => void;
}

/**
 * CVPreview - A shared component for rendering the CV document.
 * Used by both CVPreviewSection (in the editor) and CVThumbnail (in the overview).
 */
export const CVPreview = forwardRef<HTMLDivElement, CVPreviewProps>(function CVPreview(
  {
    content,
    language,
    displaySettings,
    photoUrl,
    workExperiences,
    educations,
    skillCategories,
    keyCompetences,
    userProfile,
    zoom = 1,
    isInteractive = false,
    onPageBreakToggle,
    onSectionMove,
    onSectionToggleVisibility,
    onPageProperties,
    onSidebarSectionMove,
    onSidebarSectionToggleVisibility,
    photoOptions,
    selectedPhotoId,
    onPhotoSelect,
    userInitials,
    photoSize,
    onPhotoSizeChange,
    photoShape,
    onPhotoShapeChange,
  },
  ref
) {
  return (
    <div ref={ref}>
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
        zoom={zoom}
        isInteractive={isInteractive}
        onPageBreakToggle={onPageBreakToggle}
        onSectionMove={onSectionMove}
        onSectionToggleVisibility={onSectionToggleVisibility}
        onPageProperties={onPageProperties}
        onSidebarSectionMove={onSidebarSectionMove}
        onSidebarSectionToggleVisibility={onSidebarSectionToggleVisibility}
        photoOptions={photoOptions}
        selectedPhotoId={selectedPhotoId}
        onPhotoSelect={onPhotoSelect}
        userInitials={userInitials}
        photoSize={photoSize}
        onPhotoSizeChange={onPhotoSizeChange}
        photoShape={photoShape}
        onPhotoShapeChange={onPhotoShapeChange}
      />
    </div>
  );
});
