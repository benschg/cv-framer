'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Loader2, Plus, X } from 'lucide-react';
import {
  fetchSkillCategories,
  createSkillCategory,
  deleteSkillCategory,
  updateSkillCategory,
  type ProfileSkillCategory,
} from '@/services/profile-career.service';
import { useProfileManager } from '@/hooks/use-profile-manager';
import { ProfileCardManager } from './ProfileCardManager';
import { SortableCard } from './SortableCard';
import { useTranslations } from '@/hooks/use-translations';

interface SkillsManagerProps {
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
}

export interface SkillsManagerRef {
  handleAdd: () => void;
}

export const SkillsManager = forwardRef<SkillsManagerRef, SkillsManagerProps>(
  ({ onSavingChange, onSaveSuccessChange }, ref) => {
  const { t } = useTranslations('en'); // TODO: Get language from user settings context
  const {
    items: skillCategories,
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
  } = useProfileManager<ProfileSkillCategory>({
    fetchItems: fetchSkillCategories,
    createItem: createSkillCategory,
    updateItem: updateSkillCategory,
    deleteItem: deleteSkillCategory,
    defaultItem: {
      category: '',
      skills: [],
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
      items={skillCategories}
      onDragEnd={handleDragEnd}
      renderCard={(category) => {
        const expanded = isExpanded(category.id);
        const formData = getFormData(category.id);
        return (
          <SortableCard
            id={category.id}
            disabled={false}
            showDragHandle={!expanded}
          >
            {expanded ? (
              <SkillCategoryEditForm
                formData={formData}
                onFieldChange={(field, value) => handleFieldChange(category.id, field, value)}
                onDone={() => handleDone(category.id)}
                t={t}
              />
            ) : (
              <SkillCategoryViewCard
                category={category}
                onEdit={() => handleEdit(category)}
                onDelete={() => handleDelete(category.id)}
                disabled={saving}
                t={t}
              />
            )}
          </SortableCard>
        );
      }}
      renderDragOverlay={(category) => (
        <SkillCategoryCardOverlay category={category} />
      )}
      emptyState={
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>{t('profile.skills.empty')}</p>
            <p className="text-sm mt-1">{t('profile.skills.emptyAction')}</p>
          </CardContent>
        </Card>
      }
    />
  );
});

SkillsManager.displayName = 'SkillsManager';

// Edit Form Component
interface SkillCategoryEditFormProps {
  formData: Partial<ProfileSkillCategory>;
  onFieldChange: (field: keyof ProfileSkillCategory, value: any) => void;
  onDone: () => void;
  t: (key: string) => string;
}

function SkillCategoryEditForm({
  formData,
  onFieldChange,
  onDone,
  t,
}: SkillCategoryEditFormProps) {
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;

    const currentSkills = formData.skills || [];
    onFieldChange('skills', [...currentSkills, skillInput.trim()]);
    setSkillInput('');
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = [...(formData.skills || [])];
    newSkills.splice(index, 1);
    onFieldChange('skills', newSkills);
  };

  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('profile.skills.edit')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onDone}>
            {t('profile.skills.done')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">{t('profile.skills.categoryName')} *</Label>
          <Input
            id="category"
            value={formData.category || ''}
            onChange={(e) => onFieldChange('category', e.target.value)}
            placeholder={t('profile.skills.categoryPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('profile.skills.skills')}</Label>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder={t('profile.skills.skillsPlaceholder')}
            />
            <Button type="button" variant="outline" onClick={handleAddSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {(formData.skills || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {(formData.skills || []).map((skill, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </>
  );
}

// View Card Component
interface SkillCategoryViewCardProps {
  category: ProfileSkillCategory;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
  t: (key: string) => string;
}

function SkillCategoryViewCard({
  category,
  onEdit,
  onDelete,
  disabled,
  t,
}: SkillCategoryViewCardProps) {
  return (
    <>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{category.category}</CardTitle>
            <CardDescription>{category.skills.length} {t('profile.skills.skillsCount')}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={disabled}
            >
              {t('profile.skills.editButton')}
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
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {category.skills.map((skill, index) => (
            <Badge key={index} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </>
  );
}

// Overlay component shown while dragging
function SkillCategoryCardOverlay({ category }: { category: ProfileSkillCategory }) {
  return (
    <Card className="shadow-xl rotate-3 cursor-grabbing opacity-80">
      <CardHeader>
        <div>
          <CardTitle>{category.category}</CardTitle>
          <CardDescription>{category.skills.length} skills</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {category.skills.slice(0, 5).map((skill, index) => (
            <Badge key={index} variant="secondary">
              {skill}
            </Badge>
          ))}
          {category.skills.length > 5 && (
            <Badge variant="outline">+{category.skills.length - 5} more</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
