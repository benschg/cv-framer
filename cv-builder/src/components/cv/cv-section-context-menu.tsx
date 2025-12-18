'use client';

import { Settings } from 'lucide-react';
import type { ReactNode } from 'react';

import { ContextMenuItem,ContextMenuSeparator } from '@/components/ui/context-menu';
import type { CVMainSection } from '@/types/cv-layout.types';

import { CVBaseSectionContextMenu } from './cv-base-section-context-menu';

interface CVSectionContextMenuProps {
  children: ReactNode;
  sectionType: CVMainSection;
  sectionLabel: string;
  sectionIndex: number;
  totalSections: number;
  pageIndex: number;
  onMoveUp?: (pageIndex: number, sectionIndex: number) => void;
  onMoveDown?: (pageIndex: number, sectionIndex: number) => void;
  onToggleVisibility?: (sectionType: CVMainSection) => void;
  onConfigureSection?: (sectionType: CVMainSection) => void;
  onPageProperties?: (pageIndex: number) => void;
  isHidden?: boolean;
  disabled?: boolean;
}

export function CVSectionContextMenu({
  children,
  sectionType,
  sectionLabel,
  sectionIndex,
  totalSections,
  pageIndex,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onConfigureSection,
  onPageProperties,
  isHidden = false,
  disabled = false,
}: CVSectionContextMenuProps) {
  // Build additional menu items for main section-specific options
  const additionalItems = (
    <>
      {/* Configure section (for future expansion) */}
      {onConfigureSection && (
        <ContextMenuItem onClick={() => onConfigureSection(sectionType)} className="gap-2">
          <Settings className="h-4 w-4" />
          Configure...
        </ContextMenuItem>
      )}

      {/* Page Properties */}
      {onPageProperties && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onPageProperties(pageIndex)} className="gap-2">
            <Settings className="h-4 w-4" />
            Page Properties...
          </ContextMenuItem>
        </>
      )}
    </>
  );

  return (
    <CVBaseSectionContextMenu
      sectionLabel={sectionLabel}
      locationLabel="Section"
      sectionIndex={sectionIndex}
      totalSections={totalSections}
      onMoveUp={onMoveUp ? (idx) => onMoveUp(pageIndex, idx) : undefined}
      onMoveDown={onMoveDown ? (idx) => onMoveDown(pageIndex, idx) : undefined}
      onToggleVisibility={onToggleVisibility ? () => onToggleVisibility(sectionType) : undefined}
      isHidden={isHidden}
      disabled={disabled}
      additionalItems={additionalItems}
      className="cv-section-wrapper"
      dataAttributes={{
        'data-section-type': sectionType,
        'data-section-index': String(sectionIndex),
      }}
    >
      {children}
    </CVBaseSectionContextMenu>
  );
}
