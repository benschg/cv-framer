'use client';

import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { forwardRef, useImperativeHandle } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { Textarea } from '@/components/ui/textarea';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { useProfileManager } from '@/hooks/use-profile-manager';
import { formatDateRange } from '@/lib/utils';
import {
  createEducation,
  deleteEducation,
  fetchEducations,
  type ProfileEducation,
  updateEducation,
} from '@/services/profile-career.service';

import { ProfileCardManager } from './ProfileCardManager';
import { SortableCard } from './SortableCard';

interface EducationManagerProps {
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
}

export interface EducationManagerRef {
  handleAdd: () => void;
}

export const EducationManager = forwardRef<EducationManagerRef, EducationManagerProps>(
  ({ onSavingChange, onSaveSuccessChange }, ref) => {
    const { t } = useAppTranslation();
    const {
      items: educationList,
      isExpanded,
      getFormData,
      loading,
      saving,
      handleAdd,
      handleEdit,
      handleDelete,
      handleDone,
      handleFieldChange,
      handleDragEnd,
    } = useProfileManager<ProfileEducation>({
      fetchItems: fetchEducations,
      createItem: (item) =>
        createEducation(
          item as Omit<ProfileEducation, 'id' | 'user_id' | 'created_at' | 'updated_at'>
        ),
      updateItem: updateEducation,
      deleteItem: deleteEducation,
      defaultItem: {
        institution: '',
        degree: '',
        field: '',
        start_date: '',
        end_date: '',
        description: '',
        grade: '',
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
        items={educationList}
        onDragEnd={handleDragEnd}
        renderCard={(education) => {
          const expanded = isExpanded(education.id);
          const formData = getFormData(education.id);
          return (
            <SortableCard id={education.id} disabled={false} showDragHandle={!expanded}>
              {expanded ? (
                <EducationEditForm
                  formData={formData}
                  onFieldChange={(field, value) => handleFieldChange(education.id, field, value)}
                  onDone={() => handleDone(education.id)}
                  t={t}
                />
              ) : (
                <EducationViewCard
                  education={education}
                  onEdit={() => handleEdit(education)}
                  onDelete={() => handleDelete(education.id)}
                  disabled={saving}
                  t={t}
                />
              )}
            </SortableCard>
          );
        }}
        renderDragOverlay={(education) => <EducationCardOverlay education={education} />}
        emptyState={
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>{t('profile.education.empty')}</p>
              <p className="mt-1 text-sm">{t('profile.education.emptyAction')}</p>
            </CardContent>
          </Card>
        }
      />
    );
  }
);

EducationManager.displayName = 'EducationManager';

// Edit Form Component
interface EducationEditFormProps {
  formData: Partial<ProfileEducation>;
  onFieldChange: (field: keyof ProfileEducation, value: string | boolean) => void;
  onDone: () => void;
  t: (key: string) => string;
}

function EducationEditForm({ formData, onFieldChange, onDone, t }: EducationEditFormProps) {
  // Check if end date is before start date
  const isEndDateBeforeStart = (() => {
    if (!formData.start_date || !formData.end_date) return false;
    return formData.end_date < formData.start_date;
  })();

  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('profile.education.edit')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onDone}>
            {t('profile.education.done')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="degree">{t('profile.education.degree')} *</Label>
            <Input
              id="degree"
              value={formData.degree || ''}
              onChange={(e) => onFieldChange('degree', e.target.value)}
              placeholder={t('profile.education.degreePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="field">{t('profile.education.fieldOfStudy')}</Label>
            <Input
              id="field"
              value={formData.field || ''}
              onChange={(e) => onFieldChange('field', e.target.value)}
              placeholder={t('profile.education.fieldOfStudyPlaceholder')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution">{t('profile.education.institution')} *</Label>
          <Input
            id="institution"
            value={formData.institution || ''}
            onChange={(e) => onFieldChange('institution', e.target.value)}
            placeholder={t('profile.education.institutionPlaceholder')}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('profile.education.startDate')} *</Label>
            <MonthYearPicker
              value={formData.start_date || ''}
              onChange={(value) => onFieldChange('start_date', value)}
              placeholder={t('profile.education.startDatePlaceholder')}
              showFutureWarning
            />
          </div>
          <div className="space-y-2">
            <Label>{t('profile.education.endDate')}</Label>
            <MonthYearPicker
              value={formData.end_date || ''}
              onChange={(value) => onFieldChange('end_date', value)}
              placeholder={t('profile.education.endDatePlaceholder')}
              showFutureWarning
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade">{t('profile.education.grade')}</Label>
            <Input
              id="grade"
              value={formData.grade || ''}
              onChange={(e) => onFieldChange('grade', e.target.value)}
              placeholder={t('profile.education.gradePlaceholder')}
            />
          </div>
        </div>

        {isEndDateBeforeStart && (
          <p className="flex items-center gap-1 text-sm text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            {t('profile.education.endDateError')}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="description">{t('profile.education.description')}</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => onFieldChange('description', e.target.value)}
            placeholder={t('profile.education.descriptionPlaceholder')}
            rows={3}
          />
        </div>
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
  t: (key: string) => string;
}

function EducationViewCard({ education, onEdit, onDelete, disabled, t }: EducationViewCardProps) {
  return (
    <>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>
              {education.degree}
              {education.field && ` ${t('profile.education.in')} ${education.field}`}
            </CardTitle>
            <CardDescription>{education.institution}</CardDescription>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDateRange(education.start_date, education.end_date)}
              {education.grade && ` • ${education.grade}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit} disabled={disabled}>
              {t('profile.education.editButton')}
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} disabled={disabled}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {education.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{education.description}</p>
        </CardContent>
      )}
    </>
  );
}

// Overlay component shown while dragging
function EducationCardOverlay({ education }: { education: ProfileEducation }) {
  return (
    <Card className="rotate-3 cursor-grabbing opacity-80 shadow-xl">
      <CardHeader>
        <div>
          <CardTitle>
            {education.degree}
            {education.field && ` in ${education.field}`}
          </CardTitle>
          <CardDescription>{education.institution}</CardDescription>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateRange(education.start_date, education.end_date)}
            {education.grade && ` • ${education.grade}`}
          </p>
        </div>
      </CardHeader>
    </Card>
  );
}
