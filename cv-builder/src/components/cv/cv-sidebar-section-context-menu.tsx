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
import { ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import type { CVSidebarSection } from '@/types/cv-layout.types';

interface CVSidebarSectionContextMenuProps {
  children: ReactNode;
  sectionType: CVSidebarSection;
  sectionLabel: string;
  sectionIndex: number;
  totalSections: number;
  onMoveUp?: (sectionIndex: number) => void;
  onMoveDown?: (sectionIndex: number) => void;
  onToggleVisibility?: (sectionType: CVSidebarSection) => void;
  isHidden?: boolean;
  disabled?: boolean;
}

export function CVSidebarSectionContextMenu({
  children,
  sectionType,
  sectionLabel,
  sectionIndex,
  totalSections,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  isHidden = false,
  disabled = false,
}: CVSidebarSectionContextMenuProps) {
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
          className="cv-sidebar-section-wrapper"
          data-sidebar-section-type={sectionType}
          data-sidebar-section-index={sectionIndex}
        >
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuLabel className="flex items-center gap-2">
          <span className="font-medium">{sectionLabel}</span>
          <span className="text-xs text-muted-foreground">Sidebar</span>
        </ContextMenuLabel>
        <ContextMenuSeparator />

        {/* Move options */}
        <ContextMenuItem
          onClick={() => onMoveUp?.(sectionIndex)}
          disabled={!canMoveUp}
          className="gap-2"
        >
          <ArrowUp className="h-4 w-4" />
          Move Up
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onMoveDown?.(sectionIndex)}
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
      </ContextMenuContent>
    </ContextMenu>
  );
}
