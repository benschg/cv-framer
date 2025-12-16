'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
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
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{t('errors.dashboard.title')}</CardTitle>
          <CardDescription>
            {t('errors.dashboard.message')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
              {error.message}
            </pre>
          )}
          <div className="flex gap-2 justify-center">
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
