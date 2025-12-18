'use client';

import type { ReactNode } from 'react';
import { CVSidebarSectionContextMenu, type PhotoOption, type PhotoSize } from './cv-sidebar-section-context-menu';
import { getSidebarLabel } from './constants';
import type { CVSidebarSection } from '@/types/cv-layout.types';

interface CVSidebarSectionWrapperProps {
  children: ReactNode;
  sectionType: CVSidebarSection;
  sectionIndex: number;
  totalSections: number;
  onMoveUp?: (sectionIndex: number) => void;
  onMoveDown?: (sectionIndex: number) => void;
  onToggleVisibility?: (sectionType: CVSidebarSection) => void;
  /** Photo options for the submenu */
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
  isHidden?: boolean;
  isInteractive?: boolean;
  language?: 'en' | 'de';
}

export function CVSidebarSectionWrapper({
  children,
  sectionType,
  sectionIndex,
  totalSections,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  photoOptions,
  selectedPhotoId,
  onPhotoSelect,
  userInitials,
  photoSize,
  onPhotoSizeChange,
  isHidden = false,
  isInteractive = true,
  language = 'en',
}: CVSidebarSectionWrapperProps) {
  const sectionLabel = getSidebarLabel(sectionType, language);

  return (
    <CVSidebarSectionContextMenu
      sectionType={sectionType}
      sectionLabel={sectionLabel}
      sectionIndex={sectionIndex}
      totalSections={totalSections}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      onToggleVisibility={onToggleVisibility}
      photoOptions={photoOptions}
      selectedPhotoId={selectedPhotoId}
      onPhotoSelect={onPhotoSelect}
      userInitials={userInitials}
      photoSize={photoSize}
      onPhotoSizeChange={onPhotoSizeChange}
      isHidden={isHidden}
      disabled={!isInteractive}
    >
      {children}
    </CVSidebarSectionContextMenu>
  );
}
