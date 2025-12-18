'use client';

import { type ReactNode, type RefObject, useRef, useState } from 'react';

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
    onRefreshNeeded?: () => void;
  }) => ReactNode;

  // Optional features
  headerActions?: ReactNode;

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
  const handleRefreshNeeded = () => {
    // TODO: In Phase 2, implement actual refresh logic
    // For now, just log to console
    console.log('Refresh needed for section:', section);
  };

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
          {/* Optional header actions (e.g., AI upload buttons) */}
          {headerActions && <div className="mt-4">{headerActions}</div>}
        </DialogHeader>

        {/* Manager component renders here */}
        <div className="mt-4">
          {children({
            managerRef,
            onSavingChange: setIsSaving,
            onSaveSuccessChange: setSaveSuccess,
            onRefreshNeeded: handleRefreshNeeded,
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
