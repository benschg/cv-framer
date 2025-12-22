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
      <style>
        {`
          .cv-thumbnail-preview {
            width: 100%;
            height: 100%;
          }
          .cv-thumbnail-preview .cv-document-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            gap: 0 !important;
            background: transparent !important;
            min-height: auto !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
          }
          .cv-thumbnail-preview .cv-page {
            position: relative !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            height: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            min-height: 100% !important;
            max-height: 100% !important;
          }
          .cv-thumbnail-preview .cv-page-content {
            height: 100% !important;
            overflow: visible !important;
          }
          .cv-thumbnail-preview .cv-page:not(:first-child) {
            display: none !important;
          }
          .cv-thumbnail-preview .cv-page-footer {
            display: none !important;
          }
        `}
      </style>
      <div className="pointer-events-none h-full w-full">
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
