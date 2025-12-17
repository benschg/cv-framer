'use client';

import type { ReactNode } from 'react';
import { CVSectionContextMenu } from './cv-section-context-menu';
import { getSectionLabel } from './constants';
import type { CVMainSection } from '@/types/cv-layout.types';

interface CVSectionWrapperProps {
  children: ReactNode;
  sectionType: CVMainSection;
  sectionIndex: number;
  totalSections: number;
  pageIndex: number;
  onMoveUp?: (pageIndex: number, sectionIndex: number) => void;
  onMoveDown?: (pageIndex: number, sectionIndex: number) => void;
  onToggleVisibility?: (sectionType: CVMainSection) => void;
  onConfigureSection?: (sectionType: CVMainSection) => void;
  onPageProperties?: (pageIndex: number) => void;
  isHidden?: boolean;
  isInteractive?: boolean;
  language?: 'en' | 'de';
}

export function CVSectionWrapper({
  children,
  sectionType,
  sectionIndex,
  totalSections,
  pageIndex,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onConfigureSection,
  onPageProperties,
  isHidden = false,
  isInteractive = true,
  language = 'en',
}: CVSectionWrapperProps) {
  const sectionLabel = getSectionLabel(sectionType, language);

  return (
    <CVSectionContextMenu
      sectionType={sectionType}
      sectionLabel={sectionLabel}
      sectionIndex={sectionIndex}
      totalSections={totalSections}
      pageIndex={pageIndex}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      onToggleVisibility={onToggleVisibility}
      onConfigureSection={onConfigureSection}
      onPageProperties={onPageProperties}
      isHidden={isHidden}
      disabled={!isInteractive}
    >
      {children}
    </CVSectionContextMenu>
  );
}
