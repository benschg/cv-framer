'use client';

import type { PhotoSize } from './cv-photo-context-menu';

interface CVSidebarPhotoProps {
  /** Photo URL to display */
  photoUrl: string;
  /** Alt text for the image */
  alt?: string;
  /** Photo size */
  size?: PhotoSize;
}

/**
 * CV Sidebar photo component with size support
 */
export function CVSidebarPhoto({
  photoUrl,
  alt = 'Profile',
  size = 'medium',
}: CVSidebarPhotoProps) {
  return (
    <div className="cv-sidebar-photo" data-photo-size={size}>
      <img src={photoUrl} alt={alt} />
    </div>
  );
}
