# Profile Manager Pattern

This document describes the reusable pattern for creating profile data managers (Work Experience, Education, Skills, Certifications, References).

## Overview

The profile manager pattern provides:
- Auto-save with 1-second debounce
- Drag-and-drop reordering with smooth animations
- Expand/collapse edit mode
- Save indicator in breadcrumb header
- CRUD operations with optimistic updates

## Architecture

### 1. Core Hook: `useProfileManager`

Location: [src/hooks/use-profile-manager.ts](cv-builder/src/hooks/use-profile-manager.ts)

Generic hook that handles all state management and data operations.

**Features:**
- Items state management
- Auto-save with debouncing
- CRUD operations (create, read, update, delete)
- Drag-and-drop reordering
- Loading and saving states

**Usage:**
```typescript
const {
  items,
  editingId,
  formData,
  loading,
  saving,
  handleAdd,
  handleEdit,
  handleDelete,
  handleDone,
  handleFieldChange,
  handleMultiFieldChange,
  handleDragEnd,
} = useProfileManager<ProfileWorkExperience>({
  fetchItems: fetchWorkExperiences,
  createItem: createWorkExperience,
  updateItem: updateWorkExperience,
  deleteItem: deleteWorkExperience,
  defaultItem: {
    company: '',
    title: '',
    // ... default fields
  },
  onSavingChange,
  onSaveSuccessChange,
});
```

### 2. Drag-and-Drop: `ProfileCardManager`

Location: [src/components/profile/ProfileCardManager.tsx](cv-builder/src/components/profile/ProfileCardManager.tsx)

Wrapper component that provides drag-and-drop context using @dnd-kit.

**Features:**
- DndContext setup with PointerSensor (8px activation threshold)
- SortableContext for vertical list
- DragOverlay for visual feedback
- Empty state support

**Props:**
```typescript
interface ProfileCardManagerProps<T extends { id: string }> {
  items: T[];
  onDragEnd: (oldIndex: number, newIndex: number) => void;
  renderCard: (item: T, index: number) => ReactNode;
  renderDragOverlay?: (item: T) => ReactNode;
  emptyState?: ReactNode;
}
```

### 3. Sortable Card Wrapper: `SortableCard`

Location: [src/components/profile/SortableCard.tsx](cv-builder/src/components/profile/SortableCard.tsx)

Individual card wrapper with drag handle and animations.

**Features:**
- GripVertical drag handle
- CSS transforms for smooth animations
- Disabled state support
- Dragging visual feedback

**Props:**
```typescript
interface SortableCardProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  showDragHandle?: boolean;
}
```

### 4. Save Indicator Hook: `useHeaderSaveIndicator`

Location: [src/hooks/use-header-save-indicator.ts](cv-builder/src/hooks/use-header-save-indicator.ts)

Injects save status into the breadcrumb header.

**Usage:**
```typescript
const [isSaving, setIsSaving] = useState(false);
const [saveSuccess, setSaveSuccess] = useState(false);

useHeaderSaveIndicator(isSaving, saveSuccess);
```

## Implementation Guide

### Step 1: Service Functions

Ensure you have these service functions in [src/services/profile-career.service.ts](cv-builder/src/services/profile-career.service.ts):

```typescript
export async function fetchYourItems() {
  return fetchProfileData<YourType>('your_table', [
    { column: 'display_order', ascending: true },
  ]);
}

export async function createYourItem(item: Omit<YourType, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  return createProfileData<YourType>('your_table', item);
}

export async function updateYourItem(id: string, updates: Partial<Omit<YourType, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
  return updateProfileData<YourType>('your_table', id, updates);
}

export async function deleteYourItem(id: string) {
  return deleteProfileData('your_table', id);
}
```

### Step 2: Manager Component

Create your manager component (e.g., `education-manager.tsx`):

```typescript
'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { useProfileManager } from '@/hooks/use-profile-manager';
import { ProfileCardManager } from './ProfileCardManager';
import { SortableCard } from './SortableCard';
import type { ProfileEducation } from '@/types/profile-career.types';

interface EducationManagerProps {
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
}

export interface EducationManagerRef {
  handleAdd: () => void;
}

export const EducationManager = forwardRef<EducationManagerRef, EducationManagerProps>(
  ({ onSavingChange, onSaveSuccessChange }, ref) => {
    const {
      items: educations,
      editingId,
      formData,
      loading,
      saving,
      handleAdd,
      handleEdit,
      handleDelete,
      handleDone,
      handleFieldChange,
      handleMultiFieldChange,
      handleDragEnd,
    } = useProfileManager<ProfileEducation>({
      fetchItems: fetchEducations,
      createItem: createEducation,
      updateItem: updateEducation,
      deleteItem: deleteEducation,
      defaultItem: {
        institution: '',
        degree: '',
        field: '',
        // ... other default fields
      },
      onSavingChange,
      onSaveSuccessChange,
    });

    useImperativeHandle(ref, () => ({
      handleAdd,
    }));

    if (loading) {
      return <Loader2 className="h-8 w-8 animate-spin" />;
    }

    return (
      <ProfileCardManager
        items={educations}
        onDragEnd={handleDragEnd}
        renderCard={(education) => (
          <SortableCard
            id={education.id}
            disabled={editingId !== null && editingId !== education.id}
            showDragHandle={editingId !== education.id}
          >
            {editingId === education.id ? (
              <EducationEditForm
                formData={formData}
                onFieldChange={handleFieldChange}
                onDone={handleDone}
              />
            ) : (
              <EducationViewCard
                education={education}
                onEdit={() => handleEdit(education)}
                onDelete={() => handleDelete(education.id)}
                disabled={editingId !== null || saving}
              />
            )}
          </SortableCard>
        )}
        renderDragOverlay={(education) => (
          <EducationCardOverlay education={education} />
        )}
        emptyState={
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No education added yet.</p>
            </CardContent>
          </Card>
        }
      />
    );
  }
);

EducationManager.displayName = 'EducationManager';
```

### Step 3: Edit and View Components

Create separate components for edit and view modes:

```typescript
// Edit Form Component
interface EducationEditFormProps {
  formData: Partial<ProfileEducation>;
  onFieldChange: (field: keyof ProfileEducation, value: any) => void;
  onDone: () => void;
}

function EducationEditForm({ formData, onFieldChange, onDone }: EducationEditFormProps) {
  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Edit Education</CardTitle>
          <Button variant="ghost" size="sm" onClick={onDone}>
            Done
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form fields */}
        <Input
          value={formData.institution || ''}
          onChange={(e) => onFieldChange('institution', e.target.value)}
        />
        {/* More fields... */}
      </CardContent>
    </>
  );
}

// View Card Component
interface EducationViewCardProps {
  education: ProfileEducation;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
}

function EducationViewCard({ education, onEdit, onDelete, disabled }: EducationViewCardProps) {
  return (
    <>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{education.degree}</CardTitle>
            <CardDescription>{education.institution}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit} disabled={disabled}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} disabled={disabled}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </>
  );
}
```

### Step 4: Page Component

Create the page that uses the manager:

```typescript
'use client';

import { useState, useRef } from 'react';
import { useHeaderSaveIndicator } from '@/hooks/use-header-save-indicator';
import { EducationManager, type EducationManagerRef } from '@/components/profile/education-manager';

export default function EducationPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<EducationManagerRef>(null);

  useHeaderSaveIndicator(isSaving, saveSuccess);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Education</h1>
          <p>Manage your educational background</p>
        </div>
        <Button onClick={() => managerRef.current?.handleAdd()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>
      <EducationManager
        ref={managerRef}
        onSavingChange={setIsSaving}
        onSaveSuccessChange={setSaveSuccess}
      />
    </div>
  );
}
```

## Key Benefits

1. **Consistency**: All profile managers behave the same way
2. **DRY**: Shared logic extracted into reusable hooks and components
3. **Type Safety**: Generic types ensure compile-time safety
4. **Auto-save**: 1-second debounce prevents excessive API calls
5. **UX**: Smooth drag-and-drop with visual feedback
6. **Maintainability**: Changes to core logic update all managers

## Examples

See [src/components/profile/work-experience-manager.tsx](cv-builder/src/components/profile/work-experience-manager.tsx) for a complete implementation.

## Next Steps

Apply this pattern to:
- [ ] Education Manager
- [ ] Skills Manager
- [ ] Certifications Manager
- [ ] References Manager
