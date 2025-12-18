'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { forwardRef, useImperativeHandle } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { useProfileManager } from '@/hooks/use-profile-manager';
import {
  createKeyCompetence,
  deleteKeyCompetence,
  fetchKeyCompetences,
  type ProfileKeyCompetence,
  updateKeyCompetence,
} from '@/services/profile-career.service';

import { ProfileCardManager } from './ProfileCardManager';
import { SortableCard } from './SortableCard';

interface KeyCompetencesManagerProps {
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
}

export interface KeyCompetencesManagerRef {
  handleAdd: () => void;
}

export const KeyCompetencesManager = forwardRef<
  KeyCompetencesManagerRef,
  KeyCompetencesManagerProps
>(({ onSavingChange, onSaveSuccessChange }, ref) => {
  const { t } = useAppTranslation();
  const {
    items: keyCompetences,
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
  } = useProfileManager<ProfileKeyCompetence>({
    fetchItems: fetchKeyCompetences,
    createItem: (item) =>
      createKeyCompetence(
        item as Omit<ProfileKeyCompetence, 'id' | 'user_id' | 'created_at' | 'updated_at'>
      ),
    updateItem: updateKeyCompetence,
    deleteItem: deleteKeyCompetence,
    defaultItem: {
      title: '',
      description: null,
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
      items={keyCompetences}
      onDragEnd={handleDragEnd}
      renderCard={(competence) => {
        const expanded = isExpanded(competence.id);
        const formData = getFormData(competence.id);
        return (
          <SortableCard id={competence.id} disabled={false} showDragHandle={!expanded}>
            {expanded ? (
              <KeyCompetenceEditForm
                formData={formData}
                onFieldChange={(field, value) => handleFieldChange(competence.id, field, value)}
                onDone={() => handleDone(competence.id)}
                t={t}
              />
            ) : (
              <KeyCompetenceViewCard
                competence={competence}
                onEdit={() => handleEdit(competence)}
                onDelete={() => handleDelete(competence.id)}
                disabled={saving}
                t={t}
              />
            )}
          </SortableCard>
        );
      }}
      renderDragOverlay={(competence) => <KeyCompetenceCardOverlay competence={competence} />}
      emptyState={
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>{t('profile.keyCompetences.empty')}</p>
            <p className="mt-1 text-sm">{t('profile.keyCompetences.emptyAction')}</p>
          </CardContent>
        </Card>
      }
    />
  );
});

KeyCompetencesManager.displayName = 'KeyCompetencesManager';

// Edit Form Component
interface KeyCompetenceEditFormProps {
  formData: Partial<ProfileKeyCompetence>;
  onFieldChange: (field: keyof ProfileKeyCompetence, value: string | null) => void;
  onDone: () => void;
  t: (key: string) => string;
}

function KeyCompetenceEditForm({ formData, onFieldChange, onDone, t }: KeyCompetenceEditFormProps) {
  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('profile.keyCompetences.edit')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onDone}>
            {t('profile.keyCompetences.done')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('profile.keyCompetences.title')} *</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => onFieldChange('title', e.target.value)}
            placeholder={t('profile.keyCompetences.titlePlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('profile.keyCompetences.description')}</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => onFieldChange('description', e.target.value)}
            placeholder={t('profile.keyCompetences.descriptionPlaceholder')}
            rows={3}
          />
        </div>
      </CardContent>
    </>
  );
}

// View Card Component
interface KeyCompetenceViewCardProps {
  competence: ProfileKeyCompetence;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
  t: (key: string) => string;
}

function KeyCompetenceViewCard({
  competence,
  onEdit,
  onDelete,
  disabled,
  t,
}: KeyCompetenceViewCardProps) {
  return (
    <>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{competence.title}</CardTitle>
            {competence.description && (
              <CardDescription className="mt-1">{competence.description}</CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit} disabled={disabled}>
              {t('profile.keyCompetences.editButton')}
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

// Overlay component shown while dragging
function KeyCompetenceCardOverlay({ competence }: { competence: ProfileKeyCompetence }) {
  return (
    <Card className="rotate-3 cursor-grabbing opacity-80 shadow-xl">
      <CardHeader>
        <div>
          <CardTitle>{competence.title}</CardTitle>
          {competence.description && (
            <CardDescription className="mt-1 line-clamp-2">
              {competence.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
