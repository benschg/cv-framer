'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppTranslation } from '@/hooks/use-app-translation';

interface BasicInfoFormProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
  };
  onChange: (name: string, value: string) => void;
}

export function BasicInfoForm({ formData, onChange }: BasicInfoFormProps) {
  const { t } = useAppTranslation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.name, e.target.value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.basicInfo.title')}</CardTitle>
        <CardDescription>
          {t('profile.basicInfo.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('profile.basicInfo.firstName')}</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder={t('profile.basicInfo.firstNamePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t('profile.basicInfo.lastName')}</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder={t('profile.basicInfo.lastNamePlaceholder')}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t('profile.basicInfo.email')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={t('profile.basicInfo.emailPlaceholder')}
            disabled
          />
          <p className="text-xs text-muted-foreground">
            {t('profile.basicInfo.emailNote')}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">{t('profile.basicInfo.phone')}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder={t('profile.basicInfo.phonePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">{t('profile.basicInfo.location')}</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder={t('profile.basicInfo.locationPlaceholder')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
