'use client';

import type { ReactNode } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from '@/components/ui/context-menu';
import { ContextMenuTrigger } from '@radix-ui/react-context-menu';
import { ArrowUp, ArrowDown, Eye, EyeOff, Settings, GripVertical } from 'lucide-react';
import type { CVMainSection } from '@/types/cv-layout.types';

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
  const canMoveUp = sectionIndex > 0;
  const canMoveDown = sectionIndex < totalSections - 1;

  // If disabled, just render children without context menu
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="cv-section-wrapper group relative"
          data-section-type={sectionType}
          data-section-index={sectionIndex}
        >
          {/* Hover indicator for interactive mode */}
          <div className="absolute -left-1 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-400/50 transition-colors pointer-events-none print:hidden" />

          {/* Drag handle indicator (visual only for now) */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none print:hidden">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel className="flex items-center gap-2">
          <span className="font-medium">{sectionLabel}</span>
          <span className="text-xs text-muted-foreground">Section</span>
        </ContextMenuLabel>
        <ContextMenuSeparator />

        {/* Move options */}
        <ContextMenuItem
          onClick={() => onMoveUp?.(pageIndex, sectionIndex)}
          disabled={!canMoveUp}
          className="gap-2"
        >
          <ArrowUp className="h-4 w-4" />
          Move Up
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onMoveDown?.(pageIndex, sectionIndex)}
          disabled={!canMoveDown}
          className="gap-2"
        >
          <ArrowDown className="h-4 w-4" />
          Move Down
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Visibility toggle */}
        <ContextMenuItem
          onClick={() => onToggleVisibility?.(sectionType)}
          className="gap-2"
        >
          {isHidden ? (
            <>
              <Eye className="h-4 w-4" />
              Show Section
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4" />
              Hide Section
            </>
          )}
        </ContextMenuItem>

        {/* Configure section (for future expansion) */}
        {onConfigureSection && (
          <ContextMenuItem
            onClick={() => onConfigureSection(sectionType)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Configure...
          </ContextMenuItem>
        )}

        {/* Page Properties */}
        {onPageProperties && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => onPageProperties(pageIndex)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Page Properties...
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
