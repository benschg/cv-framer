'use client';

import { CVDocument } from '@/components/cv/cv-document';
import type { CVDocument as CVDocumentType } from '@/types/cv.types';

interface CVThumbnailProps {
  cv: CVDocumentType;
  className?: string;
}

export function CVThumbnail({ cv, className }: CVThumbnailProps) {
  return (
    <div
      className={`relative aspect-[1/1.414] overflow-hidden rounded-lg border bg-white shadow-sm ${className ?? ''}`}
    >
      <div
        className="pointer-events-none origin-top-left overflow-hidden"
        style={{
          transform: 'scale(0.15)',
          width: '666.67%', // 100% / 0.15 to compensate for scale
          height: '141.4%', // Only show first page (A4 ratio 1:1.414)
        }}
      >
        <style>
          {`
            .cv-thumbnail-preview .cv-page {
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
            .cv-thumbnail-preview .cv-page:not(:first-child) {
              display: none !important;
            }
          `}
        </style>
        <div className="cv-thumbnail-preview">
          <CVDocument
            content={cv.content}
            settings={cv.display_settings}
            language={cv.language}
            isInteractive={false}
          />
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 opacity-0 transition-all hover:bg-black/5 hover:opacity-100" />
    </div>
  );
}
