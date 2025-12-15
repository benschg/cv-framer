'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { BulletListEditor } from '@/components/ui/bullet-list-editor';
import { formatDateRange } from '@/lib/utils';
import {
  fetchWorkExperiences,
  createWorkExperience,
  deleteWorkExperience,
  updateWorkExperience,
  type ProfileWorkExperience,
} from '@/services/profile-career.service';
import { useProfileManager } from '@/hooks/use-profile-manager';
import { ProfileCardManager } from './ProfileCardManager';
import { SortableCard } from './SortableCard';

interface WorkExperienceManagerProps {
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
}

export interface WorkExperienceManagerRef {
  handleAdd: () => void;
}

export const WorkExperienceManager = forwardRef<WorkExperienceManagerRef, WorkExperienceManagerProps>(
  ({ onSavingChange, onSaveSuccessChange }, ref) => {
  const {
    items: experiences,
    isExpanded,
    getFormData,
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
      location: '',
      start_date: '',
      end_date: '',
      current: false,
      description: '',
      bullets: [],
    },
    onSavingChange,
    onSaveSuccessChange,
  });

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
    <ProfileCardManager
      items={experiences}
      onDragEnd={handleDragEnd}
      renderCard={(experience) => {
        const expanded = isExpanded(experience.id);
        const formData = getFormData(experience.id);
        return (
          <SortableCard
            id={experience.id}
            disabled={false}
            showDragHandle={!expanded}
          >
            {expanded ? (
              <ExperienceEditForm
                formData={formData}
                onFieldChange={(field, value) => handleFieldChange(experience.id, field, value)}
                onMultiFieldChange={(updates) => handleMultiFieldChange(experience.id, updates)}
                onDone={() => handleDone(experience.id)}
              />
            ) : (
              <ExperienceViewCard
                experience={experience}
                onEdit={() => handleEdit(experience)}
                onDelete={() => handleDelete(experience.id)}
                disabled={saving}
              />
            )}
          </SortableCard>
        );
      }}
      renderDragOverlay={(experience) => (
        <ExperienceCardOverlay experience={experience} />
      )}
      emptyState={
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No work experience added yet.</p>
            <p className="text-sm mt-1">Click "Add Experience" to get started.</p>
          </CardContent>
        </Card>
      }
    />
  );
});

WorkExperienceManager.displayName = 'WorkExperienceManager';

// Edit Form Component
interface ExperienceEditFormProps {
  formData: Partial<ProfileWorkExperience>;
  onFieldChange: (field: keyof ProfileWorkExperience, value: any) => void;
  onMultiFieldChange: (updates: Partial<ProfileWorkExperience>) => void;
  onDone: () => void;
}

function ExperienceEditForm({
  formData,
  onFieldChange,
  onMultiFieldChange,
  onDone,
}: ExperienceEditFormProps) {
  // Check if end date is before start date
  const isEndDateBeforeStart = (() => {
    if (!formData.start_date || !formData.end_date || formData.current) return false;
    return formData.end_date < formData.start_date;
  })();

  return (
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
            <Label>Start Date *</Label>
            <MonthYearPicker
              value={formData.start_date || ''}
              onChange={(value) => onFieldChange('start_date', value)}
              placeholder="Select start date"
              showFutureWarning
            />
          </div>
          {!formData.current && (
            <div className="space-y-2">
              <Label>End Date</Label>
              <MonthYearPicker
                value={formData.end_date || ''}
                onChange={(value) => onFieldChange('end_date', value)}
                placeholder="Select end date"
                showFutureWarning
              />
            </div>
          )}
        </div>

        {isEndDateBeforeStart && (
          <p className="flex items-center gap-1 text-sm text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            End date cannot be before start date
          </p>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="current"
            checked={!!formData.current}
            onCheckedChange={(checked) => {
              const isChecked = checked === true;
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

        <BulletListEditor
          label="Key Achievements & Responsibilities"
          bullets={formData.bullets || []}
          onChange={(bullets) => onFieldChange('bullets', bullets)}
          placeholder="Achieved X% increase in..."
          addButtonLabel="Add Bullet"
        />
      </CardContent>
    </>
  );
}

// View Card Component
interface ExperienceViewCardProps {
  experience: ProfileWorkExperience;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
}

function ExperienceViewCard({
  experience,
  onEdit,
  onDelete,
  disabled,
}: ExperienceViewCardProps) {
  return (
    <>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{experience.title}</CardTitle>
            <CardDescription>
              {experience.company}
              {experience.location && ` • ${experience.location}`}
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDateRange(experience.start_date, experience.end_date, experience.current)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={disabled}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={disabled}
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
  );
}

// Overlay component shown while dragging
function ExperienceCardOverlay({ experience }: { experience: ProfileWorkExperience }) {
  return (
    <Card className="shadow-xl rotate-3 cursor-grabbing opacity-80">
      <CardHeader>
        <div>
          <CardTitle>{experience.title}</CardTitle>
          <CardDescription>
            {experience.company}
            {experience.location && ` • ${experience.location}`}
          </CardDescription>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDateRange(experience.start_date, experience.end_date, experience.current)}
          </p>
        </div>
      </CardHeader>
    </Card>
  );
}
