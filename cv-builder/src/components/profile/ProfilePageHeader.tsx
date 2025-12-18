'use client';

import { Plus } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

export interface ProfilePageHeaderProps {
  title: string;
  description: string;
  addButtonLabel?: string;
  onAdd?: () => void;
  children?: ReactNode;
}

export function ProfilePageHeader({
  title,
  description,
  addButtonLabel,
  onAdd,
  children,
}: ProfilePageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {addButtonLabel && onAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
