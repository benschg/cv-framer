'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import type { ProfileProject } from '@/types/profile-career.types';

interface ProjectEditFormProps {
  formData: Partial<ProfileProject>;
  onFieldChange: (field: keyof ProfileProject, value: any) => void;
  onDone: () => void;
  t: (key: string) => string;
}

export function ProjectEditForm({
  formData,
  onFieldChange,
  onDone,
  t,
}: ProjectEditFormProps) {
  const [techInput, setTechInput] = useState('');

  const handleAddTechnology = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      const currentTech = formData.technologies || [];
      if (!currentTech.includes(techInput.trim())) {
        onFieldChange('technologies', [...currentTech, techInput.trim()]);
      }
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (techToRemove: string) => {
    const currentTech = formData.technologies || [];
    onFieldChange('technologies', currentTech.filter(t => t !== techToRemove));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('profile.projects.edit')}</CardTitle>
          <Button onClick={onDone} size="sm">
            {t('profile.projects.done')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('profile.projects.nameLabel')}</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => onFieldChange('name', e.target.value)}
            placeholder={t('profile.projects.namePlaceholder')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="role">{t('profile.projects.roleLabel')}</Label>
            <Input
              id="role"
              value={formData.role || ''}
              onChange={(e) => onFieldChange('role', e.target.value)}
              placeholder={t('profile.projects.rolePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">{t('profile.projects.urlLabel')}</Label>
            <Input
              id="url"
              type="url"
              value={formData.url || ''}
              onChange={(e) => onFieldChange('url', e.target.value)}
              placeholder={t('profile.projects.urlPlaceholder')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('profile.projects.descriptionLabel')}</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => onFieldChange('description', e.target.value)}
            placeholder={t('profile.projects.descriptionPlaceholder')}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="technologies">{t('profile.projects.technologiesLabel')}</Label>
          <Input
            id="technologies"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={handleAddTechnology}
            placeholder={t('profile.projects.technologiesPlaceholder')}
          />
          {formData.technologies && formData.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="gap-1">
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTechnology(tech)}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_date">{t('profile.projects.startDate')}</Label>
            <MonthYearPicker
              value={formData.start_date || ''}
              onChange={(value) => onFieldChange('start_date', value)}
              placeholder={t('profile.projects.startDatePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">{t('profile.projects.endDate')}</Label>
            <MonthYearPicker
              value={formData.end_date || ''}
              onChange={(value) => onFieldChange('end_date', value)}
              placeholder={t('profile.projects.endDatePlaceholder')}
              disabled={formData.current || false}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="current"
            checked={formData.current || false}
            onCheckedChange={(checked) => onFieldChange('current', checked)}
          />
          <Label htmlFor="current" className="cursor-pointer">
            {t('profile.projects.currentlyWorking')}
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="outcome">{t('profile.projects.outcomeLabel')}</Label>
          <Textarea
            id="outcome"
            value={formData.outcome || ''}
            onChange={(e) => onFieldChange('outcome', e.target.value)}
            placeholder={t('profile.projects.outcomePlaceholder')}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
