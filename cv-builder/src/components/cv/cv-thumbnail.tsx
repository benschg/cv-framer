'use client';

import { FileText } from 'lucide-react';

import type { CVDocument } from '@/types/cv.types';

interface CVThumbnailProps {
  cv: CVDocument;
  className?: string;
}

export function CVThumbnail({ cv, className }: CVThumbnailProps) {
  const { content } = cv;

  return (
    <div
      className={`relative aspect-[1/1.414] overflow-hidden rounded-lg border bg-white shadow-sm ${className ?? ''}`}
    >
      {/* Simulated A4 page preview */}
      <div className="h-full w-full p-3 text-[4px]">
        {/* Header section */}
        <div className="mb-2 border-b pb-2">
          <div className="mb-1 h-2 w-3/4 rounded bg-gray-800" />
          {content.tagline ? <div className="h-1 w-1/2 rounded bg-gray-400" /> : null}
        </div>

        {/* Profile section */}
        {content.profile ? (
          <div className="mb-2">
            <div className="mb-1 h-1 w-1/3 rounded bg-gray-600" />
            <div className="space-y-0.5">
              <div className="h-0.5 w-full rounded bg-gray-300" />
              <div className="h-0.5 w-full rounded bg-gray-300" />
              <div className="h-0.5 w-2/3 rounded bg-gray-300" />
            </div>
          </div>
        ) : null}

        {/* Experience section simulation */}
        <div className="mb-2">
          <div className="mb-1 h-1 w-1/4 rounded bg-gray-600" />
          <div className="space-y-1">
            <div className="space-y-0.5">
              <div className="h-0.5 w-1/2 rounded bg-gray-400" />
              <div className="h-0.5 w-full rounded bg-gray-300" />
              <div className="h-0.5 w-full rounded bg-gray-300" />
            </div>
            <div className="space-y-0.5">
              <div className="h-0.5 w-1/2 rounded bg-gray-400" />
              <div className="h-0.5 w-full rounded bg-gray-300" />
            </div>
          </div>
        </div>

        {/* Education section simulation */}
        <div className="mb-2">
          <div className="mb-1 h-1 w-1/4 rounded bg-gray-600" />
          <div className="space-y-0.5">
            <div className="h-0.5 w-1/2 rounded bg-gray-400" />
            <div className="h-0.5 w-full rounded bg-gray-300" />
          </div>
        </div>

        {/* Skills section simulation */}
        <div>
          <div className="mb-1 h-1 w-1/5 rounded bg-gray-600" />
          <div className="flex flex-wrap gap-0.5">
            <div className="h-1 w-1/6 rounded bg-gray-400" />
            <div className="h-1 w-1/5 rounded bg-gray-400" />
            <div className="h-1 w-1/6 rounded bg-gray-400" />
            <div className="h-1 w-1/4 rounded bg-gray-400" />
          </div>
        </div>
      </div>

      {/* Overlay with icon on hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all hover:bg-black/5 hover:opacity-100">
        <FileText className="h-8 w-8 text-primary" />
      </div>
    </div>
  );
}
