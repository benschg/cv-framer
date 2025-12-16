'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/hooks/use-translations';
import { useUserPreferences } from '@/contexts/user-preferences-context';

interface DefaultCvSettingsFormProps {
  defaultTagline: string;
  personalMotto: string;
  onChange: (name: string, value: string) => void;
}

export function DefaultCvSettingsForm({ defaultTagline, personalMotto, onChange }: DefaultCvSettingsFormProps) {
  const { language } = useUserPreferences();
  const { t } = useTranslations(language);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.name, e.target.value);
  };

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
            onChange={handleInputChange}
            placeholder={t('profile.defaultCvSettings.taglinePlaceholder')}
          />
          <p className="text-xs text-muted-foreground">
            {t('profile.defaultCvSettings.taglineNote')}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="personalMotto">{t('profile.defaultCvSettings.personalMottoLabel')}</Label>
          <Input
            id="personalMotto"
            name="personalMotto"
            value={personalMotto}
            onChange={handleInputChange}
            placeholder={t('profile.defaultCvSettings.personalMottoPlaceholder')}
          />
          <p className="text-xs text-muted-foreground">
            {t('profile.defaultCvSettings.mottoNote')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
