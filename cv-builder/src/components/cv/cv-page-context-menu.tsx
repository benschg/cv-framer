'use client';

import type { ReactNode } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Settings } from 'lucide-react';

interface CVPageContextMenuProps {
  children: ReactNode;
  pageIndex: number;
  onPageProperties?: (pageIndex: number) => void;
  disabled?: boolean;
}

export function CVPageContextMenu({
  children,
  pageIndex,
  onPageProperties,
  disabled = false,
}: CVPageContextMenuProps) {
  // If disabled or no callback, just render children
  if (disabled || !onPageProperties) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="cv-page-interactive-wrapper">
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={() => onPageProperties(pageIndex)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Page Properties...
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
