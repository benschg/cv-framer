'use client';

import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CVSortableSidebarSectionProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function CVSortableSidebarSection({
  id,
  children,
  disabled = false,
  className,
}: CVSortableSidebarSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
        'cv-sortable-sidebar-section group relative',
        isDragging && 'opacity-50 z-50',
        className
      )}
    >
      {/* Hover indicator */}
      <div className="absolute -left-1 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-400/50 transition-colors pointer-events-none print:hidden" />

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-5 top-0.5 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing touch-none transition-opacity pointer-events-auto print:hidden"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground hover:text-foreground" />
      </div>

      {children}
    </div>
  );
}
