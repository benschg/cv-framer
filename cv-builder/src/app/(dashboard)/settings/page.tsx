'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useUserPreferences } from '@/contexts/user-preferences-context';
import { useTranslations } from '@/hooks/use-translations';
import { AlertCircle, Download, ExternalLink, FileText, Globe, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { language, theme, setLanguage, setTheme, loading: preferencesLoading } = useUserPreferences();

  const { t } = useTranslations(language);

  const handleLanguageChange = async (newLanguage: 'en' | 'de') => {
    const { error } = await setLanguage(newLanguage);
    if (error) {
      toast.error(t('settings.errorSavingLanguage'));
    } else {
      toast.success(t('settings.languageSaved'));
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    toast.success(t('settings.themeSaved'));
  };

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
                onClick={() => handleThemeChange('light')}
                className="gap-2"
                disabled={preferencesLoading}
              >
                <Sun className="h-4 w-4" />
                {t('settings.light')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('dark')}
                className="gap-2"
                disabled={preferencesLoading}
              >
                <Moon className="h-4 w-4" />
                {t('settings.dark')}
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('system')}
                disabled={preferencesLoading}
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
                onClick={() => handleLanguageChange('en')}
                className="gap-2"
                disabled={preferencesLoading}
              >
                <Globe className="h-4 w-4" />
                {t('settings.english')}
              </Button>
              <Button
                variant={language === 'de' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLanguageChange('de')}
                className="gap-2"
                disabled={preferencesLoading}
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

      {/* Legal & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Legal & Privacy
          </CardTitle>
          <CardDescription>
            Review our legal documents and manage your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <Label className="text-base">Privacy Policy</Label>
                <p className="text-sm text-muted-foreground">
                  How we collect, use, and protect your data
                </p>
              </div>
              <Link href="/privacy" target="_blank">
                <Button variant="ghost" size="sm" className="gap-2">
                  View
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <Label className="text-base">Terms of Service</Label>
                <p className="text-sm text-muted-foreground">
                  Rules and guidelines for using our service
                </p>
              </div>
              <Link href="/terms" target="_blank">
                <Button variant="ghost" size="sm" className="gap-2">
                  View
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-base">Download Your Data</Label>
                <p className="text-sm text-muted-foreground">
                  Export all your personal data in JSON format (GDPR Article 15)
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" disabled>
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Data export functionality coming soon
            </p>
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
