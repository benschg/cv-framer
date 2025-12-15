'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SortableCardProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  showDragHandle?: boolean;
}

export function SortableCard({
  id,
  children,
  disabled = false,
  className,
  showDragHandle = true,
}: SortableCardProps) {
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-shadow',
        isDragging && 'opacity-50 ring-2 ring-primary',
        className
      )}
    >
      <div className="relative">
        {showDragHandle && !disabled && (
          <div
            {...attributes}
            {...listeners}
            className="absolute left-2 top-4 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-5 w-5" />
          </div>
        )}
        <div className={cn(showDragHandle && !disabled && 'pl-10')}>
          {children}
        </div>
      </div>
    </Card>
  );
}
