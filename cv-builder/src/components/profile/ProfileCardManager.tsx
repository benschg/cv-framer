'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent } from '@/components/ui/card';
import { ReactNode, useState } from 'react';

export interface ProfileCardManagerProps<T extends { id: string }> {
  items: T[];
  onDragEnd: (oldIndex: number, newIndex: number) => void;
  renderCard: (item: T, index: number) => ReactNode;
  renderDragOverlay?: (item: T) => ReactNode;
  emptyState?: ReactNode;
}

export function ProfileCardManager<T extends { id: string }>({
  items,
  onDragEnd,
  renderCard,
  renderDragOverlay,
  emptyState,
}: ProfileCardManagerProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onDragEnd(oldIndex, newIndex);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = items.find((item) => item.id === activeId);

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id}>
              {renderCard(item, index)}
            </div>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId && activeItem ? (
          renderDragOverlay ? (
            renderDragOverlay(activeItem)
          ) : (
            <Card className="rotate-2 shadow-xl cursor-grabbing opacity-80">
              <CardContent className="py-4">
                <div className="text-sm text-muted-foreground">
                  Dragging...
                </div>
              </CardContent>
            </Card>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
