'use client';

import { ContextMenuTrigger } from '@radix-ui/react-context-menu';
import { ArrowDown, ArrowUp, Eye, EyeOff } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';

export interface BaseSectionContextMenuProps {
  children: ReactNode;
  /** Section label to display in the menu header */
  sectionLabel: string;
  /** Location label (e.g., "Sidebar", "Main") */
  locationLabel?: string;
  /** Current section index */
  sectionIndex: number;
  /** Total number of sections */
  totalSections: number;
  /** Callback when section should move up */
  onMoveUp?: (sectionIndex: number) => void;
  /** Callback when section should move down */
  onMoveDown?: (sectionIndex: number) => void;
  /** Callback when visibility is toggled */
  onToggleVisibility?: () => void;
  /** Whether the section is currently hidden */
  isHidden?: boolean;
  /** Whether the context menu is disabled */
  disabled?: boolean;
  /** Additional menu items to render after the base items */
  additionalItems?: ReactNode;
  /** CSS class for the wrapper div */
  className?: string;
  /** Data attributes for the wrapper div */
  dataAttributes?: Record<string, string>;
}

/**
 * Base context menu for CV sections with move up/down and visibility toggle.
 * Can be extended with additional menu items via the `additionalItems` prop.
 */
export function CVBaseSectionContextMenu({
  children,
  sectionLabel,
  locationLabel = 'Section',
  sectionIndex,
  totalSections,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  isHidden = false,
  disabled = false,
  additionalItems,
  className,
  dataAttributes,
}: BaseSectionContextMenuProps) {
  const canMoveUp = sectionIndex > 0;
  const canMoveDown = sectionIndex < totalSections - 1;

  // If disabled, just render children without context menu
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className={className} {...dataAttributes}>
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuLabel className="flex items-center gap-2">
          <span className="font-medium">{sectionLabel}</span>
          <span className="text-xs text-muted-foreground">{locationLabel}</span>
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
        <ContextMenuItem onClick={onToggleVisibility} className="gap-2">
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

        {/* Additional items from specialized menus */}
        {additionalItems}
      </ContextMenuContent>
    </ContextMenu>
  );
}
