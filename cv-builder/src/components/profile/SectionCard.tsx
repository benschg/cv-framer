'use client';

import { Plus, Sparkles } from 'lucide-react';
import type { ReactNode, RefObject } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ManagerRef {
  handleAdd: () => void;
}

export interface SectionCardProps {
  /** Section title */
  title: string;
  /** Section description */
  description: string;
  /** Add button label */
  addButtonLabel: string;
  /** The manager component already rendered (uses render props pattern) */
  children: ReactNode;
  /** Ref to manager for add button */
  managerRef: RefObject<ManagerRef | null>;
  /** Whether this section has AI features */
  hasAIFeatures?: boolean;
  /** AI button label (required if hasAIFeatures is true) */
  aiButtonLabel?: string;
  /** Callback when AI button is clicked */
  onAIClick?: () => void;
}

/**
 * Generic card wrapper for profile section managers.
 * Handles consistent layout with add button and optional AI button.
 */
export function SectionCard({
  title,
  description,
  addButtonLabel,
  children,
  managerRef,
  hasAIFeatures = false,
  aiButtonLabel,
  onAIClick,
}: SectionCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex gap-2">
          {hasAIFeatures && aiButtonLabel && onAIClick && (
            <Button size="sm" variant="outline" onClick={onAIClick}>
              <Sparkles className="mr-1 h-4 w-4" />
              {aiButtonLabel}
            </Button>
          )}
          <Button size="sm" onClick={() => managerRef.current?.handleAdd()}>
            <Plus className="mr-1 h-4 w-4" />
            {addButtonLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
