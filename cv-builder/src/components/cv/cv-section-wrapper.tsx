'use client';

import type { ReactNode } from 'react';
import { CVSectionContextMenu } from './cv-section-context-menu';
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
}

const SECTION_LABELS: Record<CVMainSection, { en: string; de: string }> = {
  header: { en: 'Header', de: 'Kopfzeile' },
  profile: { en: 'Profile', de: 'Profil' },
  experience: { en: 'Work Experience', de: 'Berufserfahrung' },
  education: { en: 'Education', de: 'Ausbildung' },
  skills: { en: 'Skills', de: 'Fähigkeiten' },
  keyCompetences: { en: 'Key Competences', de: 'Kernkompetenzen' },
  projects: { en: 'Projects', de: 'Projekte' },
  references: { en: 'References', de: 'Referenzen' },
};

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
}: CVSectionWrapperProps) {
  const sectionLabel = SECTION_LABELS[sectionType]?.en || sectionType;

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
