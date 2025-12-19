'use client';

import Image from 'next/image';

import type { PhotoShape, PhotoSize } from './cv-photo-context-menu';

interface CVSidebarPhotoProps {
  /** Photo URL to display */
  photoUrl: string;
  /** Alt text for the image */
  alt?: string;
  /** Photo size */
  size?: PhotoSize;
  /** Photo shape */
  shape?: PhotoShape;
}

/**
 * CV Sidebar photo component with size and shape support
 */
export function CVSidebarPhoto({
  photoUrl,
  alt = 'Profile',
  size = 'medium',
  shape = 'square',
}: CVSidebarPhotoProps) {
  // Dynamic dimensions based on size - square photos
  const dimensions = {
    small: 85,
    medium: 105,
    large: 125,
  };

  const dimension = dimensions[size];

  return (
    <div className="cv-sidebar-photo" data-photo-size={size} data-photo-shape={shape}>
      <Image
        src={photoUrl}
        alt={alt}
        width={dimension}
        height={dimension}
        className="object-cover"
      />
    </div>
  );
}
