'use client';

import { useEffect, useRef, useState } from 'react';

import { CVDocument } from '@/components/cv/cv-document';
import type { CVDocument as CVDocumentType } from '@/types/cv.types';

interface CVThumbnailProps {
  cv: CVDocumentType;
  className?: string;
}

export function CVThumbnail({ cv, className }: CVThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.15);

  // Calculate zoom to fit the thumbnail container
  useEffect(() => {
    const calculateZoom = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      // A4 width is 210mm, convert to pixels at 96 DPI (210mm * 96/25.4 ≈ 794px)
      const previewWidth = 794;

      // Calculate zoom to fit within container
      const calculatedZoom = containerWidth / previewWidth;
      setZoom(calculatedZoom);
    };

    calculateZoom();

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(calculateZoom);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative aspect-[1/1.414] overflow-hidden rounded-lg border bg-white shadow-sm ${className ?? ''}`}
    >
      <style>
        {`
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
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .cv-thumbnail-preview .cv-page:not(:first-child) {
            display: none !important;
          }
          .cv-thumbnail-preview .cv-page-footer {
            display: none !important;
          }
        `}
      </style>
      <div className="pointer-events-none">
        <div className="cv-thumbnail-preview">
          <CVDocument
            content={cv.content}
            settings={cv.display_settings}
            language={cv.language}
            isInteractive={false}
            zoom={zoom}
          />
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 opacity-0 transition-all hover:bg-black/5 hover:opacity-100" />
    </div>
  );
}
