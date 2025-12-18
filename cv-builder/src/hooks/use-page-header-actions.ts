'use client';

import { ReactNode, useEffect } from 'react';

import { useHeaderActions } from '@/contexts/header-actions-context';

/**
 * Hook to set page-specific actions in the dashboard header.
 * Actions are automatically cleared when the component unmounts.
 *
 * @example
 * ```tsx
 * usePageHeaderActions(
 *   <Button onClick={handleAdd}>
 *     <Plus className="mr-2 h-4 w-4" />
 *     Add Item
 *   </Button>
 * );
 * ```
 */
export function usePageHeaderActions(actions: ReactNode) {
  const { setActions } = useHeaderActions();

  useEffect(() => {
    setActions(actions);

    // Clear actions on unmount
    return () => {
      setActions(null);
    };
  }, [actions, setActions]);
}
