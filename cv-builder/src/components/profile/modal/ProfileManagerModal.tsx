'use client';

import { type ReactNode, type RefObject, useCallback, useRef, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useModalSaveIndicator } from '@/hooks/use-modal-save-indicator';

export type ProfileSection =
  | 'education'
  | 'work-experience'
  | 'references'
  | 'certifications'
  | 'skills'
  | 'highlights'
  | 'projects'
  | 'key-competences'
  | 'motivation-vision'
  | 'import-cv';

// Generic manager ref interface
export interface ManagerRef {
  handleAdd: () => void;
  handleAddWithData?: (data: unknown, file?: File) => Promise<void>;
}

// Generic manager props interface
export interface ManagerProps {
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
  onRefreshNeeded?: () => void;
}

interface ProfileManagerModalProps {
  // Identity
  section: ProfileSection;

  // Modal state
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Content
  title: string;
  description?: string;

  // Manager component (as render prop for flexibility)
  children: (props: {
    managerRef: RefObject<ManagerRef | null>;
    onSavingChange: (saving: boolean) => void;
    onSaveSuccessChange: (success: boolean) => void;
    onRefreshNeeded: () => void;
    /** Key to force manager re-mount when refresh is needed */
    refreshKey: number;
  }) => ReactNode;

  // Optional features - receives managerRef so buttons can call handleAdd
  headerActions?: (managerRef: RefObject<ManagerRef | null>) => ReactNode;

  // Lifecycle callbacks
  onClose?: () => void;
}

export function ProfileManagerModal({
  section,
  open,
  onOpenChange,
  title,
  description,
  children,
  headerActions,
  onClose,
}: ProfileManagerModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const managerRef = useRef<ManagerRef>(null);

  // Generate unique container ID for this modal instance
  const modalHeaderId = `modal-header-${section}`;

  // Use modal save indicator to display status in header
  useModalSaveIndicator(isSaving, saveSuccess, modalHeaderId);

  // Handle modal close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && onClose) {
      onClose();
    }
    onOpenChange(newOpen);
  };

  // Refresh callback for document uploads (prevents page reload in modal)
  // Incrementing refreshKey causes manager to re-mount and refetch data
  const handleRefreshNeeded = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </div>
            {/* Save indicator container */}
            <div id={modalHeaderId} className="flex-shrink-0" />
          </div>
          {/* Optional header actions (e.g., Add button, AI upload buttons) */}
          {headerActions && <div className="mt-4 flex gap-2">{headerActions(managerRef)}</div>}
        </DialogHeader>

        {/* Manager component renders here */}
        <div className="mt-4">
          {children({
            managerRef,
            onSavingChange: setIsSaving,
            onSaveSuccessChange: setSaveSuccess,
            onRefreshNeeded: handleRefreshNeeded,
            refreshKey,
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
