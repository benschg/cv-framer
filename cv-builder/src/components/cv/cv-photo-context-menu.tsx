'use client';

import { Check, ImageIcon, Maximize2, UserX } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';

import {
  type BaseSectionContextMenuProps,
  CVBaseSectionContextMenu,
} from './cv-base-section-context-menu';

/** Photo option for the context menu */
export interface PhotoOption {
  id: string;
  label: string;
  sublabel?: string;
  imageUrl?: string;
  isPrimary?: boolean;
}

/** Photo size options */
export type PhotoSize = 'small' | 'medium' | 'large';

const PHOTO_SIZE_OPTIONS: { value: PhotoSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

interface CVPhotoContextMenuProps extends Omit<
  BaseSectionContextMenuProps,
  'additionalItems' | 'sectionLabel' | 'locationLabel'
> {
  /** Photo options for the submenu */
  photoOptions?: PhotoOption[];
  /** Currently selected photo ID (null = primary, 'none' = no photo) */
  selectedPhotoId?: string | null;
  /** Callback when a photo is selected */
  onPhotoSelect?: (photoId: string | null) => void;
  /** User initials for avatar fallback */
  userInitials?: string;
  /** Current photo size */
  photoSize?: PhotoSize;
  /** Callback when photo size is changed */
  onPhotoSizeChange?: (size: PhotoSize) => void;
  /** Override section label */
  sectionLabel?: string;
  /** Override location label */
  locationLabel?: string;
}

/**
 * Photo-specific context menu extending the base section context menu.
 * Adds Change Photo and Photo Size submenus.
 */
export function CVPhotoContextMenu({
  children,
  photoOptions,
  selectedPhotoId,
  onPhotoSelect,
  userInitials = '?',
  photoSize = 'medium',
  onPhotoSizeChange,
  sectionLabel = 'Photo',
  locationLabel = 'Sidebar',
  ...baseProps
}: CVPhotoContextMenuProps) {
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

  // Build additional menu items for photo-specific options
  const photoMenuItems = (
    <>
      {/* Change Photo submenu */}
      {photoOptions && onPhotoSelect && (
        <>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Change Photo
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-56">
              {/* No Photo option */}
              <ContextMenuItem onClick={() => onPhotoSelect('none')} className="gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    <UserX className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <span className="text-sm">No Photo</span>
                </div>
                {isPhotoSelected('none') && (
                  <Check className="h-4 w-4 flex-shrink-0 text-primary" />
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
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{option.label}</span>
                    {option.sublabel && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {option.sublabel}
                      </span>
                    )}
                  </div>
                  {isPhotoSelected(option.isPrimary ? 'primary' : option.id) && (
                    <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                  )}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Photo Size submenu */}
          {onPhotoSizeChange && (
            <ContextMenuSub>
              <ContextMenuSubTrigger className="gap-2">
                <Maximize2 className="h-4 w-4" />
                Photo Size
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-32">
                {PHOTO_SIZE_OPTIONS.map((option) => (
                  <ContextMenuItem
                    key={option.value}
                    onClick={() => onPhotoSizeChange(option.value)}
                    className="gap-2"
                  >
                    <span className="flex-1">{option.label}</span>
                    {photoSize === option.value && <Check className="h-4 w-4 text-primary" />}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
        </>
      )}
    </>
  );

  return (
    <CVBaseSectionContextMenu
      {...baseProps}
      sectionLabel={sectionLabel}
      locationLabel={locationLabel}
      additionalItems={photoMenuItems}
    >
      {children}
    </CVBaseSectionContextMenu>
  );
}
