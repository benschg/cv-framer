'use client';

import type { ReactNode } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from '@/components/ui/context-menu';
import { ContextMenuTrigger } from '@radix-ui/react-context-menu';
import { ArrowUp, ArrowDown, Eye, EyeOff, ImageIcon, Check, UserX } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { CVSidebarSection } from '@/types/cv-layout.types';

/** Photo option for the context menu */
export interface PhotoOption {
  id: string;
  label: string;
  sublabel?: string;
  imageUrl?: string;
  isPrimary?: boolean;
}

interface CVSidebarSectionContextMenuProps {
  children: ReactNode;
  sectionType: CVSidebarSection;
  sectionLabel: string;
  sectionIndex: number;
  totalSections: number;
  onMoveUp?: (sectionIndex: number) => void;
  onMoveDown?: (sectionIndex: number) => void;
  onToggleVisibility?: (sectionType: CVSidebarSection) => void;
  /** Photo options for the submenu */
  photoOptions?: PhotoOption[];
  /** Currently selected photo ID (null = primary, 'none' = no photo) */
  selectedPhotoId?: string | null;
  /** Callback when a photo is selected */
  onPhotoSelect?: (photoId: string | null) => void;
  /** User initials for avatar fallback */
  userInitials?: string;
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
  photoOptions,
  selectedPhotoId,
  onPhotoSelect,
  userInitials = '?',
  isHidden = false,
  disabled = false,
}: CVSidebarSectionContextMenuProps) {
  const canMoveUp = sectionIndex > 0;
  const canMoveDown = sectionIndex < totalSections - 1;

  // If disabled, just render children without context menu
  if (disabled) {
    return <>{children}</>;
  }

  // Check if a photo option is selected
  const isPhotoSelected = (optionId: string) => {
    if (optionId === 'none') {
      return selectedPhotoId === 'none';
    }
    if (optionId === 'primary') {
      return !selectedPhotoId || selectedPhotoId === null;
    }
    return selectedPhotoId === optionId;
  };

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

        {/* Change Photo submenu (only for photo section) */}
        {sectionType === 'photo' && photoOptions && onPhotoSelect && (
          <>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Change Photo
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-56">
                {/* No Photo option */}
                <ContextMenuItem
                  onClick={() => onPhotoSelect('none')}
                  className="gap-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      <UserX className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm">No Photo</span>
                  </div>
                  {isPhotoSelected('none') && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </ContextMenuItem>

                <ContextMenuSeparator />

                {/* Photo options */}
                {photoOptions.map((option) => (
                  <ContextMenuItem
                    key={option.id}
                    onClick={() => onPhotoSelect(option.isPrimary ? null : option.id)}
                    className="gap-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={option.imageUrl} />
                      <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">{option.label}</span>
                      {option.sublabel && (
                        <span className="text-xs text-muted-foreground truncate block">
                          {option.sublabel}
                        </span>
                      )}
                    </div>
                    {isPhotoSelected(option.isPrimary ? 'primary' : option.id) && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
