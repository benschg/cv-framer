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
 */
export function CVSidebarPhoto({
  photoUrl,
  alt = 'Profile',
  size = 'medium',
}: CVSidebarPhotoProps) {
  // Dynamic dimensions based on size
  const dimensions = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 160, height: 160 },
  };

  const { width, height } = dimensions[size];

  return (
    <div className="cv-sidebar-photo" data-photo-size={size}>
      <Image src={photoUrl} alt={alt} width={width} height={height} className="object-cover" />
    </div>
  );
}
