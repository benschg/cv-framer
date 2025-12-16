'use client';

import { Button } from '@/components/ui/button';

interface PageBreakButtonProps {
  sectionId: string;
  isActive: boolean;
  onClick: () => void;
  type: 'section' | 'item';
}

export function PageBreakButton({ sectionId, isActive, onClick, type }: PageBreakButtonProps) {
  const labels = {
    section: {
      active: '↑ Remove break',
      inactive: '↓ New page',
      title: (active: boolean) => active ? 'Remove page break' : 'Add page break before this section'
    },
    item: {
      active: '↑ Remove',
      inactive: '↓ New page',
      title: (active: boolean) => active ? 'Remove page break' : 'Add page break before this item'
    }
  };

  const label = labels[type];
  const sizeClasses = type === 'section' ? 'h-6 px-2' : 'h-5 px-1';

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`${sizeClasses} text-xs gap-1 bg-white hover:bg-emerald-100 shadow-md border ${isActive ? 'text-emerald-700 hover:text-emerald-800 bg-emerald-50' : 'hover:text-emerald-700'}`}
      onClick={onClick}
      title={label.title(isActive)}
    >
      {isActive ? label.active : label.inactive}
    </Button>
  );
}
