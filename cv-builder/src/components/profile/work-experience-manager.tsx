'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
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

  const handleBulletChange = (id: string, index: number, value: string) => {
    const formData = getFormData(id) as Partial<ProfileWorkExperience>;
    const newBullets = [...(formData.bullets || [])];
    newBullets[index] = value;
    handleFieldChange(id, 'bullets', newBullets);
  };

  const handleAddBullet = (id: string) => {
    const formData = getFormData(id) as Partial<ProfileWorkExperience>;
    handleFieldChange(id, 'bullets', [...(formData.bullets || []), '']);
  };

  const handleRemoveBullet = (id: string, index: number) => {
    const formData = getFormData(id) as Partial<ProfileWorkExperience>;
    const newBullets = [...(formData.bullets || [])];
    newBullets.splice(index, 1);
    handleFieldChange(id, 'bullets', newBullets);
  };

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
                onBulletChange={(index, value) => handleBulletChange(experience.id, index, value)}
                onAddBullet={() => handleAddBullet(experience.id)}
                onRemoveBullet={(index) => handleRemoveBullet(experience.id, index)}
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
  onBulletChange: (index: number, value: string) => void;
  onAddBullet: () => void;
  onRemoveBullet: (index: number) => void;
  onDone: () => void;
}

function ExperienceEditForm({
  formData,
  onFieldChange,
  onMultiFieldChange,
  onBulletChange,
  onAddBullet,
  onRemoveBullet,
  onDone,
}: ExperienceEditFormProps) {
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
            />
          </div>
          {!formData.current && (
            <div className="space-y-2">
              <Label>End Date</Label>
              <MonthYearPicker
                value={formData.end_date || ''}
                onChange={(value) => onFieldChange('end_date', value)}
                placeholder="Select end date"
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
              {experience.start_date} - {experience.current ? 'Present' : experience.end_date}
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
            {experience.start_date} - {experience.current ? 'Present' : experience.end_date}
          </p>
        </div>
      </CardHeader>
    </Card>
  );
}
