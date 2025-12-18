'use client';

import { Plus } from 'lucide-react';
import { ReactNode, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { useHeaderSaveIndicator } from '@/hooks/use-header-save-indicator';
import { usePageHeaderActions } from '@/hooks/use-page-header-actions';

export interface ProfilePageLayoutProps {
  /** Page description shown at top of content */
  description?: string;
  /** Label for the add button */
  addButtonLabel?: string;
  /** Callback when add button is clicked */
  onAdd?: () => void;
  /** Additional header actions (e.g., AI button) */
  headerActions?: ReactNode;
  /** Page content */
  children?: ReactNode;
  /** Whether data is being saved */
  isSaving?: boolean;
  /** Whether save was successful */
  saveSuccess?: boolean;
  /** @deprecated Title is now shown in breadcrumbs */
  title?: string;
}

export function ProfilePageLayout({
  description,
  addButtonLabel,
  onAdd,
  headerActions,
  children,
  isSaving = false,
  saveSuccess = false,
}: ProfilePageLayoutProps) {
  // Display save status in breadcrumb header
  useHeaderSaveIndicator(isSaving, saveSuccess);

  // Memoize header actions to prevent infinite re-renders
  const actions = useMemo(
    () => (
      <>
        {headerActions}
        {addButtonLabel && onAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}
      </>
    ),
    [headerActions, addButtonLabel, onAdd]
  );

  // Set actions in the dashboard header
  usePageHeaderActions(actions);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {description && <p className="text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
