'use client';

import { AlertTriangle, Home,RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslations('en'); // TODO: Get language from user settings context

  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{t('errors.dashboard.title')}</CardTitle>
          <CardDescription>{t('errors.dashboard.message')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <pre className="max-h-32 overflow-auto rounded-md bg-muted p-3 text-xs">
              {error.message}
            </pre>
          )}
          <div className="flex justify-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/" className="gap-2">
                <Home className="h-4 w-4" />
                {t('errors.boundary.home')}
              </Link>
            </Button>
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t('errors.boundary.tryAgain')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
