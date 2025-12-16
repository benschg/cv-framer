'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SignupForm, GoogleOAuthButton } from '@/components/auth';
import { useTranslations } from '@/hooks/use-translations';

export default function SignupPage() {
  const { t } = useTranslations('en'); // TODO: Get language from context when auth pages support language switching

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('auth.signupPage.title')}</CardTitle>
        <CardDescription>
          {t('auth.signupPage.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleOAuthButton />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {t('auth.loginPage.emailContinue')}
            </span>
          </div>
        </div>

        <SignupForm />

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="text-primary hover:underline">
            {t('auth.signupPage.signInLink')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
