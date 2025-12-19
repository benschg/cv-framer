'use client';

import Image from 'next/image';

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
 * Dimensions match the CSS portrait aspect ratio (~0.8)
 */
export function CVSidebarPhoto({
  photoUrl,
  alt = 'Profile',
  size = 'medium',
}: CVSidebarPhotoProps) {
  // Dynamic dimensions based on size - match CSS portrait aspect ratio
  const dimensions = {
    small: { width: 70, height: 87 },
    medium: { width: 90, height: 112 },
    large: { width: 110, height: 137 },
  };

  const { width, height } = dimensions[size];

  return (
    <div className="cv-sidebar-photo" data-photo-size={size}>
      <Image src={photoUrl} alt={alt} width={width} height={height} className="object-cover" />
    </div>
  );
}
