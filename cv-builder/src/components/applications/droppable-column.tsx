'use client';

import { useDroppable } from '@dnd-kit/core';

import type { ApplicationStatus } from '@/types/cv.types';

interface DroppableColumnProps {
  status: ApplicationStatus;
  stacked?: boolean;
  children: React.ReactNode;
}

/**
 * Droppable column component for Kanban board
 */
export function DroppableColumn({ status, stacked, children }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${stacked ? 'flex-1' : ''} transition-all duration-200 ${
        isOver ? 'rounded-lg bg-primary/10' : ''
      }`}
    >
      {children}
    </div>
  );
}
