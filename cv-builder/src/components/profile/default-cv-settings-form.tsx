'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/hooks/use-translations';

interface DefaultCvSettingsFormProps {
  defaultTagline: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DefaultCvSettingsForm({ defaultTagline, onChange }: DefaultCvSettingsFormProps) {
  const { t } = useTranslations('en'); // TODO: Get language from user settings context

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.defaultCvSettings.title')}</CardTitle>
        <CardDescription>
          {t('profile.defaultCvSettings.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="defaultTagline">{t('profile.defaultCvSettings.defaultTagline')}</Label>
          <Input
            id="defaultTagline"
            name="defaultTagline"
            value={defaultTagline}
            onChange={onChange}
            placeholder={t('profile.defaultCvSettings.taglinePlaceholder')}
          />
          <p className="text-xs text-muted-foreground">
            {t('profile.defaultCvSettings.taglineNote')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
