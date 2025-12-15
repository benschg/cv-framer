'use client';

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, X, Loader2, GripVertical } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  fetchWorkExperiences,
  createWorkExperience,
  deleteWorkExperience,
  updateWorkExperience,
  debounce,
  type ProfileWorkExperience,
} from '@/services/profile-career.service';

interface WorkExperienceManagerProps {
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
}

export interface WorkExperienceManagerRef {
  handleAdd: () => void;
}

export const WorkExperienceManager = forwardRef<WorkExperienceManagerRef, WorkExperienceManagerProps>(
  ({ onSavingChange, onSaveSuccessChange }, ref) => {
  const [experiences, setExperiences] = useState<ProfileWorkExperience[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ProfileWorkExperience>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Set up drag sensors with a small activation distance to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load experiences on mount
  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    setLoading(true);
    const { data, error } = await fetchWorkExperiences();
    if (error) {
      console.error('Failed to load work experiences:', error);
    } else if (data) {
      setExperiences(data);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    setSaving(true);
    onSavingChange?.(true);
    onSaveSuccessChange?.(false);

    const newExperience = {
      company: '',
      title: '',
      location: '',
      start_date: '',
      end_date: '',
      current: false,
      description: '',
      bullets: [],
      display_order: experiences.length,
    };

    const { data, error } = await createWorkExperience(newExperience);

    setSaving(false);
    onSavingChange?.(false);

    if (error) {
      console.error('Failed to create work experience:', error);
      alert('Failed to create work experience');
    } else if (data) {
      setExperiences([data, ...experiences]);
      setEditingId(data.id);
      setFormData(data);
      onSaveSuccessChange?.(true);
      setTimeout(() => {
        onSaveSuccessChange?.(false);
      }, 2000);
    }
  };

  const handleEdit = (experience: ProfileWorkExperience) => {
    setEditingId(experience.id);
    setFormData(experience);
  };


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work experience?')) {
      return;
    }

    setSaving(true);
    onSavingChange?.(true);
    onSaveSuccessChange?.(false);

    const { error } = await deleteWorkExperience(id);

    setSaving(false);
    onSavingChange?.(false);

    if (error) {
      console.error('Failed to delete work experience:', error);
      alert('Failed to delete work experience');
    } else {
      setExperiences(experiences.filter(e => e.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setFormData({});
      }
      onSaveSuccessChange?.(true);
      setTimeout(() => {
        onSaveSuccessChange?.(false);
      }, 2000);
    }
  };

  // Auto-save handler with debouncing
  const handleFieldChange = useCallback((field: keyof ProfileWorkExperience, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    // Auto-save if we're editing an existing entry (save even with partial data)
    if (editingId) {
      onSavingChange?.(true);
      onSaveSuccessChange?.(false);

      // Debounced save function
      const debouncedSave = debounce(
        `work-experience-${editingId}`,
        async () => {
          const { data, error } = await updateWorkExperience(editingId, updatedData);

          onSavingChange?.(false);

          if (!error && data) {
            onSaveSuccessChange?.(true);
            // Update the experience in the list using functional update
            setExperiences(prevExperiences =>
              prevExperiences.map(exp =>
                exp.id === editingId ? data : exp
              )
            );
            // Clear success indicator after 2 seconds
            setTimeout(() => {
              onSaveSuccessChange?.(false);
            }, 2000);
          } else if (error) {
            console.error('Auto-save failed:', error);
          }
        },
        1000
      );

      debouncedSave();
    }
  }, [editingId, formData, onSavingChange, onSaveSuccessChange]);

  // Helper to update multiple fields at once (for checkbox case)
  const handleMultiFieldChange = useCallback((updates: Partial<ProfileWorkExperience>) => {
    const updatedData = { ...formData, ...updates };
    setFormData(updatedData);

    // Auto-save if we're editing an existing entry
    if (editingId) {
      onSavingChange?.(true);
      onSaveSuccessChange?.(false);

      const debouncedSave = debounce(
        `work-experience-${editingId}`,
        async () => {
          const { data, error } = await updateWorkExperience(editingId, updatedData);

          onSavingChange?.(false);

          if (!error && data) {
            onSaveSuccessChange?.(true);
            setExperiences(prevExperiences =>
              prevExperiences.map(exp =>
                exp.id === editingId ? data : exp
              )
            );
            setTimeout(() => {
              onSaveSuccessChange?.(false);
            }, 2000);
          } else if (error) {
            console.error('Auto-save failed:', error);
          }
        },
        1000
      );

      debouncedSave();
    }
  }, [editingId, formData, onSavingChange, onSaveSuccessChange]);

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...(formData.bullets || [])];
    newBullets[index] = value;
    handleFieldChange('bullets', newBullets);
  };

  const handleAddBullet = () => {
    handleFieldChange('bullets', [...(formData.bullets || []), '']);
  };

  const handleRemoveBullet = (index: number) => {
    const newBullets = [...(formData.bullets || [])];
    newBullets.splice(index, 1);
    handleFieldChange('bullets', newBullets);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = experiences.findIndex((exp) => exp.id === active.id);
    const newIndex = experiences.findIndex((exp) => exp.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newExperiences = [...experiences];
    const [draggedItem] = newExperiences.splice(oldIndex, 1);
    newExperiences.splice(newIndex, 0, draggedItem);

    // Update local state immediately for smooth UX
    setExperiences(newExperiences);

    // Update display_order in the backend
    onSavingChange?.(true);
    onSaveSuccessChange?.(false);

    try {
      // Update all affected items
      await Promise.all(
        newExperiences.map((exp, idx) =>
          updateWorkExperience(exp.id, { display_order: idx })
        )
      );

      onSavingChange?.(false);
      onSaveSuccessChange?.(true);
      setTimeout(() => {
        onSaveSuccessChange?.(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to update order:', error);
      onSavingChange?.(false);
      // Reload experiences on error
      loadExperiences();
    }
  };

  const activeExperience = activeId
    ? experiences.find((exp) => exp.id === activeId)
    : null;

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    handleAdd,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Experience List */}
        {experiences.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No work experience added yet.</p>
              <p className="text-sm mt-1">Click "Add Experience" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <SortableContext
            items={experiences.map(exp => exp.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {experiences.map((experience) => (
                <SortableExperienceCard
                  key={experience.id}
                  experience={experience}
                  isEditing={editingId === experience.id}
                  isDragging={activeId === experience.id}
                  formData={formData}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onFieldChange={handleFieldChange}
                  onMultiFieldChange={handleMultiFieldChange}
                  onBulletChange={handleBulletChange}
                  onAddBullet={handleAddBullet}
                  onRemoveBullet={handleRemoveBullet}
                  onDone={() => {
                    setEditingId(null);
                    setFormData({});
                  }}
                  disabled={editingId !== null && editingId !== experience.id}
                  saving={saving}
                  onSavingChange={onSavingChange}
                  onSaveSuccessChange={onSaveSuccessChange}
                  editingId={editingId}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
      <DragOverlay>
        {activeExperience && !editingId ? (
          <ExperienceCardOverlay experience={activeExperience} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});

WorkExperienceManager.displayName = 'WorkExperienceManager';

// Sortable Experience Card Component
interface SortableExperienceCardProps {
  experience: ProfileWorkExperience;
  isEditing: boolean;
  isDragging: boolean;
  formData: Partial<ProfileWorkExperience>;
  onEdit: (experience: ProfileWorkExperience) => void;
  onDelete: (id: string) => void;
  onFieldChange: (field: keyof ProfileWorkExperience, value: any) => void;
  onMultiFieldChange: (updates: Partial<ProfileWorkExperience>) => void;
  onBulletChange: (index: number, value: string) => void;
  onAddBullet: () => void;
  onRemoveBullet: (index: number) => void;
  onDone: () => void;
  disabled: boolean;
  saving: boolean;
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
  editingId: string | null;
}

function SortableExperienceCard({
  experience,
  isEditing,
  isDragging,
  formData,
  onEdit,
  onDelete,
  onFieldChange,
  onMultiFieldChange,
  onBulletChange,
  onAddBullet,
  onRemoveBullet,
  onDone,
  disabled,
  saving,
  onSavingChange,
  onSaveSuccessChange,
  editingId,
}: SortableExperienceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: experience.id,
    disabled: isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all ${isDragging ? 'opacity-30 scale-95' : ''}`}
    >
      {isEditing ? (
        // Edit Mode
        <>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Edit Experience</CardTitle>
              <Button variant="ghost" size="sm" onClick={onDone}>
                Done
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => onFieldChange('title', e.target.value)}
                  placeholder="Senior Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company || ''}
                  onChange={(e) => onFieldChange('company', e.target.value)}
                  placeholder="Tech Corp Inc."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="month"
                  value={formData.start_date || ''}
                  onChange={(e) => onFieldChange('start_date', e.target.value)}
                />
              </div>
              {!formData.current && (
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="month"
                    value={formData.end_date || ''}
                    onChange={(e) => onFieldChange('end_date', e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="current"
                checked={!!formData.current}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true;
                  // Update both fields atomically to prevent race conditions
                  onMultiFieldChange({
                    current: isChecked,
                    end_date: isChecked ? '' : formData.end_date,
                  });
                }}
              />
              <Label htmlFor="current" className="text-sm font-normal cursor-pointer">
                I currently work here
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => onFieldChange('location', e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => onFieldChange('description', e.target.value)}
                placeholder="Brief description of your role..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Key Achievements & Responsibilities</Label>
                <Button type="button" variant="outline" size="sm" onClick={onAddBullet}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Bullet
                </Button>
              </div>
              {(formData.bullets || []).map((bullet, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={bullet}
                    onChange={(e) => onBulletChange(index, e.target.value)}
                    placeholder="• Achieved X% increase in..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveBullet(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </>
      ) : (
        // View Mode
        <>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing pt-1"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <CardTitle>{experience.title}</CardTitle>
                <CardDescription>
                  {experience.company}
                  {experience.location && ` • ${experience.location}`}
                </CardDescription>
                <p className="text-sm text-muted-foreground mt-1">
                  {experience.start_date} - {experience.current ? 'Present' : experience.end_date}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(experience)}
                  disabled={disabled || saving}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(experience.id)}
                  disabled={disabled || saving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {(experience.description || (experience.bullets && experience.bullets.length > 0)) && (
            <CardContent>
              {experience.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {experience.description}
                </p>
              )}
              {experience.bullets && experience.bullets.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {experience.bullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          )}
        </>
      )}
    </Card>
  );
}

// Overlay component shown while dragging
function ExperienceCardOverlay({ experience }: { experience: ProfileWorkExperience }) {
  return (
    <Card className="shadow-xl rotate-3 cursor-grabbing">
      <CardHeader>
        <div className="flex items-start gap-3">
          <GripVertical className="h-5 w-5 text-muted-foreground pt-1" />
          <div className="flex-1">
            <CardTitle>{experience.title}</CardTitle>
            <CardDescription>
              {experience.company}
              {experience.location && ` • ${experience.location}`}
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-1">
              {experience.start_date} - {experience.current ? 'Present' : experience.end_date}
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
