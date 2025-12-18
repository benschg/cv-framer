'use client';

import type { ReactNode } from 'react';
import { CVBaseSectionContextMenu } from './cv-base-section-context-menu';
import { CVPhotoContextMenu, type PhotoOption, type PhotoSize } from './cv-photo-context-menu';
import { getSidebarLabel } from './constants';
import type { CVSidebarSection } from '@/types/cv-layout.types';

// Re-export types for convenience
export type { PhotoOption, PhotoSize } from './cv-photo-context-menu';

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

  // Common props for context menus
  const baseProps = {
    sectionIndex,
    totalSections,
    onMoveUp,
    onMoveDown,
    onToggleVisibility: onToggleVisibility ? () => onToggleVisibility(sectionType) : undefined,
    isHidden,
    disabled: !isInteractive,
    className: 'cv-sidebar-section-wrapper',
    dataAttributes: {
      'data-sidebar-section-type': sectionType,
      'data-sidebar-section-index': String(sectionIndex),
    },
  };

  // Use photo-specific context menu for photo section
  if (sectionType === 'photo') {
    return (
      <CVPhotoContextMenu
        {...baseProps}
        sectionLabel={sectionLabel}
        locationLabel="Sidebar"
        photoOptions={photoOptions}
        selectedPhotoId={selectedPhotoId}
        onPhotoSelect={onPhotoSelect}
        userInitials={userInitials}
        photoSize={photoSize}
        onPhotoSizeChange={onPhotoSizeChange}
      >
        {children}
      </CVPhotoContextMenu>
    );
  }

  // Use base context menu for all other sections
  return (
    <CVBaseSectionContextMenu
      {...baseProps}
      sectionLabel={sectionLabel}
      locationLabel="Sidebar"
    >
      {children}
    </CVBaseSectionContextMenu>
  );
}
