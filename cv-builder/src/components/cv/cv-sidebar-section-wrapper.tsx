'use client';

import type { ReactNode } from 'react';
import { CVSidebarSectionContextMenu } from './cv-sidebar-section-context-menu';
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
      isHidden={isHidden}
      disabled={!isInteractive}
    >
      {children}
    </CVSidebarSectionContextMenu>
  );
}
