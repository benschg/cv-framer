'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Pencil } from 'lucide-react';

interface EditableBreadcrumbProps {
  /** Label for the parent segment */
  parentLabel: string;
  /** URL to navigate to when parent is clicked */
  parentHref: string;
  /** Current page label (editable) */
  currentLabel: string;
  /** Callback when the label is saved */
  onSave: (newLabel: string) => Promise<void>;
  /** Optional CSS classes */
  className?: string;
}

export function EditableBreadcrumb({
  parentLabel,
  parentHref,
  currentLabel,
  onSave,
  className = '',
}: EditableBreadcrumbProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState('');

  const handleEdit = () => {
    setEditedLabel(currentLabel);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedLabel.trim()) {
      setIsEditing(false);
      return;
    }

    await onSave(editedLabel.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedLabel('');
  };

  const handleParentClick = () => {
    router.push(parentHref);
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Input
          value={editedLabel}
          onChange={(e) => setEditedLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="h-8 w-64"
          autoFocus
        />
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <Save className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          ×
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-sm font-semibold ${className}`}>
      <button
        onClick={handleParentClick}
        className="text-foreground hover:text-primary hover:underline transition-colors"
      >
        {parentLabel}
      </button>
      <span className="text-muted-foreground">/</span>
      <button
        onClick={handleEdit}
        className="group flex items-center gap-1 text-foreground hover:text-primary transition-colors"
      >
        {currentLabel}
        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
}
