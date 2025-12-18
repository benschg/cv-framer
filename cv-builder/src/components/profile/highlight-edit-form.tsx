'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { HighlightType, ProfileHighlight } from '@/types/profile-career.types';

interface HighlightEditFormProps {
  formData: Partial<ProfileHighlight>;
  onFieldChange: (field: keyof ProfileHighlight, value: string | HighlightType) => void;
  onDone: () => void;
  t: (key: string) => string;
}

export function HighlightEditForm({ formData, onFieldChange, onDone, t }: HighlightEditFormProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('profile.highlights.edit')}</CardTitle>
          <Button onClick={onDone} size="sm">
            {t('profile.highlights.done')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="type">{t('profile.highlights.typeLabel')}</Label>
          <Select
            value={formData.type || 'highlight'}
            onValueChange={(value) => onFieldChange('type', value as HighlightType)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('profile.highlights.typeLabel')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highlight">{t('profile.highlights.types.highlight')}</SelectItem>
              <SelectItem value="achievement">
                {t('profile.highlights.types.achievement')}
              </SelectItem>
              <SelectItem value="mehrwert">{t('profile.highlights.types.mehrwert')}</SelectItem>
              <SelectItem value="usp">{t('profile.highlights.types.usp')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">{t('profile.highlights.titleLabel')}</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => onFieldChange('title', e.target.value)}
            placeholder={t('profile.highlights.titlePlaceholder')}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">{t('profile.highlights.descriptionLabel')}</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => onFieldChange('description', e.target.value)}
            placeholder={t('profile.highlights.descriptionPlaceholder')}
            rows={4}
          />
        </div>

        {/* Metric (optional) */}
        <div className="space-y-2">
          <Label htmlFor="metric">{t('profile.highlights.metricLabel')}</Label>
          <Input
            id="metric"
            value={formData.metric || ''}
            onChange={(e) => onFieldChange('metric', e.target.value)}
            placeholder={t('profile.highlights.metricPlaceholder')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
