'use client';

import Link from 'next/link';
import { Suspense } from 'react';

import { GoogleOAuthButton,LoginForm } from '@/components/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from '@/hooks/use-translations';

function LoginContent() {
  const { t } = useTranslations('en'); // TODO: Get language from context when auth pages support language switching

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('auth.loginPage.title')}</CardTitle>
        <CardDescription>{t('auth.loginPage.subtitle')}</CardDescription>
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

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link href="/signup" className="text-primary hover:underline">
            {t('auth.loginPage.signUpLink')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  const { t } = useTranslations('en');

  return (
    <Suspense fallback={<div>{t('auth.loginPage.loading')}</div>}>
      <LoginContent />
    </Suspense>
  );
}
