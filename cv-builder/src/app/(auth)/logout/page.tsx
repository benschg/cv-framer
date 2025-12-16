'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useUserPreferences } from '@/contexts/user-preferences-context';
import { useTranslations } from '@/hooks/use-translations';
import { toast } from 'sonner';

export default function LogoutPage() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { language } = useUserPreferences();
  const { t } = useTranslations(language);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // If user is already logged out, redirect to home
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
      toast.success(t('auth.logoutPage.success'));

      // Small delay to show the success message before redirect
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      setIsSigningOut(false);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Don't show anything if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <LogOut className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-2xl">{t('auth.logoutPage.title')}</CardTitle>
        <CardDescription className="text-base">
          {t('auth.logoutPage.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-center text-muted-foreground">
          {t('auth.logoutPage.description')}
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            variant="default"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isSigningOut ? t('auth.logoutPage.signingOut') : t('auth.logoutPage.confirm')}
          </Button>

          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSigningOut}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('auth.logoutPage.cancel')}
          </Button>
        </div>

        <div className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link href="/signup" className="text-primary hover:underline">
              {t('auth.loginPage.signUpLink')}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
