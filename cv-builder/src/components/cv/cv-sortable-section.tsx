'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CVSortableSectionProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function CVSortableSection({
  id,
  children,
  disabled = false,
  className,
}: CVSortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'cv-sortable-section group relative',
        isDragging && 'z-50 opacity-50',
        className
      )}
    >
      {/* Hover indicator */}
      <div className="pointer-events-none absolute -left-1 bottom-0 top-0 w-1 bg-transparent transition-colors group-hover:bg-blue-400/50 print:hidden" />

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="pointer-events-auto absolute -left-6 top-1 cursor-grab touch-none opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100 print:hidden"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      </div>

      {children}
    </div>
  );
}
