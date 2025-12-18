'use client';

import { AlertCircle, CheckCircle2, ExternalLink, FileType, Search, XCircle } from 'lucide-react';
import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppTranslation } from '@/hooks/use-app-translation';

export function ATSFormattingGuideContent() {
  const { t } = useAppTranslation();

  const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Garamond', 'Georgia', 'Cambria'];

  const elementsToAvoid = [
    t('guides.atsFormatting.elementsToAvoid.items.tables'),
    t('guides.atsFormatting.elementsToAvoid.items.textBoxes'),
    t('guides.atsFormatting.elementsToAvoid.items.images'),
    t('guides.atsFormatting.elementsToAvoid.items.columns'),
    t('guides.atsFormatting.elementsToAvoid.items.headers'),
    t('guides.atsFormatting.elementsToAvoid.items.headings'),
    t('guides.atsFormatting.elementsToAvoid.items.hyperlinks'),
    t('guides.atsFormatting.elementsToAvoid.items.fonts'),
  ];

  const acceptableElements = [
    t('guides.atsFormatting.acceptableElements.items.bold'),
    t('guides.atsFormatting.acceptableElements.items.italics'),
    t('guides.atsFormatting.acceptableElements.items.underlines'),
    t('guides.atsFormatting.acceptableElements.items.bullets'),
    t('guides.atsFormatting.acceptableElements.items.colors'),
  ];

  const scanningItems = [
    t('guides.atsFormatting.scanningStrategy.items.format'),
    t('guides.atsFormatting.scanningStrategy.items.contact'),
    t('guides.atsFormatting.scanningStrategy.items.recent'),
  ];

  const keywordItems = [
    t('guides.atsFormatting.keywords.items.skills'),
    t('guides.atsFormatting.keywords.items.attention'),
    t('guides.atsFormatting.keywords.items.requirements'),
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4">
      {/* Hero Section */}
      <div className="space-y-4">
        <Badge variant="secondary" className="mb-2">
          {t('guides.atsFormatting.badge')}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">{t('guides.atsFormatting.title')}</h1>
        <p className="text-xl text-muted-foreground">{t('guides.atsFormatting.subtitle')}</p>
      </div>

      {/* What is ATS Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t('guides.atsFormatting.whatIsAts.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('guides.atsFormatting.whatIsAts.description1')}
          </p>
          <p className="text-muted-foreground">
            {t('guides.atsFormatting.whatIsAts.description2')}
          </p>
        </CardContent>
      </Card>

      {/* Alert Box */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('guides.atsFormatting.proTip.title')}</AlertTitle>
        <AlertDescription>{t('guides.atsFormatting.proTip.description')}</AlertDescription>
      </Alert>

      {/* Elements to Avoid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            {t('guides.atsFormatting.elementsToAvoid.title')}
          </CardTitle>
          <CardDescription>{t('guides.atsFormatting.elementsToAvoid.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {elementsToAvoid.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Elements to Use */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {t('guides.atsFormatting.acceptableElements.title')}
          </CardTitle>
          <CardDescription>
            {t('guides.atsFormatting.acceptableElements.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {acceptableElements.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Best Practices Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* File Format */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileType className="h-5 w-5" />
              {t('guides.atsFormatting.fileFormat.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
              <p className="font-semibold text-green-900 dark:text-green-100">
                {t('guides.atsFormatting.fileFormat.recommended')}
              </p>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                {t('guides.atsFormatting.fileFormat.description')}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('guides.atsFormatting.fileFormat.note')}
            </p>
          </CardContent>
        </Card>

        {/* Fonts */}
        <Card>
          <CardHeader>
            <CardTitle>{t('guides.atsFormatting.fonts.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('guides.atsFormatting.fonts.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              {fonts.map((font) => (
                <Badge key={font} variant="secondary" style={{ fontFamily: font }}>
                  {font}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanning Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>{t('guides.atsFormatting.scanningStrategy.title')}</CardTitle>
          <CardDescription>
            {t('guides.atsFormatting.scanningStrategy.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('guides.atsFormatting.scanningStrategy.intro')}
          </p>
          <ul className="space-y-2 text-muted-foreground">
            {scanningItems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>{t('guides.atsFormatting.keywords.title')}</CardTitle>
          <CardDescription>{t('guides.atsFormatting.keywords.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{t('guides.atsFormatting.keywords.intro')}</p>
          <ul className="space-y-2 text-muted-foreground">
            {keywordItems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('guides.atsFormatting.keywords.warning.title')}</AlertTitle>
            <AlertDescription>
              {t('guides.atsFormatting.keywords.warning.description')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Source Attribution */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">{t('guides.atsFormatting.source.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            {t('guides.atsFormatting.source.description')}
          </p>
          <a
            href="https://careers.roche.com/global/en/resume-parsing-faq"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            {t('guides.atsFormatting.source.link')}
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <h3 className="text-2xl font-bold">{t('guides.atsFormatting.cta.title')}</h3>
            <p className="text-primary-foreground/90">
              {t('guides.atsFormatting.cta.description')}
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Link
                href="/cv"
                className="inline-flex items-center justify-center rounded-md bg-primary-foreground px-6 py-2 text-sm font-medium text-primary transition-opacity hover:opacity-90"
              >
                {t('guides.atsFormatting.cta.button')}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
