'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useTranslations } from '@/hooks/use-translations';
import { AlertCircle, Globe, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState<'en' | 'de'>('en');

  const { t } = useTranslations(language);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.appearance')}</CardTitle>
          <CardDescription>
            {t('settings.appearanceDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('settings.theme')}</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="gap-2"
              >
                <Sun className="h-4 w-4" />
                {t('settings.light')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="gap-2"
              >
                <Moon className="h-4 w-4" />
                {t('settings.dark')}
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
              >
                {t('settings.system')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.language')}</CardTitle>
          <CardDescription>
            {t('settings.languageDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('settings.applicationLanguage')}</Label>
            <div className="flex gap-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
                className="gap-2"
              >
                <Globe className="h-4 w-4" />
                {t('settings.english')}
              </Button>
              <Button
                variant={language === 'de' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('de')}
                className="gap-2"
              >
                <Globe className="h-4 w-4" />
                {t('settings.german')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('settings.languageHint')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.account')}</CardTitle>
          <CardDescription>
            {t('settings.accountDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('settings.email')}</Label>
            <p className="text-sm">{user?.email}</p>
          </div>
          <div className="space-y-2">
            <Label>{t('settings.accountCreated')}</Label>
            <p className="text-sm text-muted-foreground">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')
                : t('settings.unknown')}
            </p>
          </div>
          <div className="pt-4">
            <Button variant="outline" onClick={() => signOut()}>
              {t('settings.signOut')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {t('settings.dangerZone')}
          </CardTitle>
          <CardDescription>
            {t('settings.dangerZoneDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('settings.deleteAccount')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.deleteAccountDescription')}
            </p>
          </div>
          <Button variant="destructive" disabled>
            {t('settings.deleteAccount')}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t('settings.deleteAccountDisabled')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
