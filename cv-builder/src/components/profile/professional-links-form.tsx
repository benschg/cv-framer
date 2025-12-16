'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppTranslation } from '@/hooks/use-app-translation';

interface ProfessionalLinksFormProps {
  formData: {
    linkedinUrl: string;
    githubUrl: string;
    websiteUrl: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfessionalLinksForm({ formData, onChange }: ProfessionalLinksFormProps) {
  const { t } = useAppTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.professionalLinks.title')}</CardTitle>
        <CardDescription>
          {t('profile.professionalLinks.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">{t('profile.professionalLinks.linkedinUrl')}</Label>
          <Input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            value={formData.linkedinUrl}
            onChange={onChange}
            placeholder={t('profile.professionalLinks.linkedinPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubUrl">{t('profile.professionalLinks.githubUrl')}</Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            value={formData.githubUrl}
            onChange={onChange}
            placeholder={t('profile.professionalLinks.githubPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">{t('profile.professionalLinks.websiteUrl')}</Label>
          <Input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            value={formData.websiteUrl}
            onChange={onChange}
            placeholder={t('profile.professionalLinks.websitePlaceholder')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
