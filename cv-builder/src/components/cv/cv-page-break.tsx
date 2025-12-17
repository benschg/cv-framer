'use client';

import { PageBreakButton } from './page-break-button';

interface CVPageBreakProps {
  sectionId: string;
  type: 'section' | 'item';
  isActive: boolean;
  onToggle?: (sectionId: string) => void;
}

export function CVPageBreak({ sectionId, type, isActive, onToggle }: CVPageBreakProps) {
  return (
    <>
      {isActive && <div className="mt-3 border-b-2 border-gray-400" />}
      {onToggle && (
        <div className="absolute -bottom-2 z-10" style={{ right: '-2cm' }}>
          <PageBreakButton
            sectionId={sectionId}
            isActive={isActive}
            onClick={() => onToggle(sectionId)}
            type={type}
          />
        </div>
      )}
    </>
  );
}
