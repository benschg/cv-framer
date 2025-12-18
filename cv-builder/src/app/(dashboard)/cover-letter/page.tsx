'use client';

import { Calendar, ExternalLink, FileText, Mail, MoreVertical, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppLanguage } from '@/hooks/use-app-language';
import { useTranslations } from '@/hooks/use-translations';
import { deleteCoverLetter, fetchCoverLetters } from '@/services/cover-letter.service';
import type { CoverLetter, CoverLetterContent } from '@/types/cv.types';

export default function CoverLetterListPage() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useAppLanguage();
  const { translations } = useTranslations(language);

  useEffect(() => {
    const loadCoverLetters = async () => {
      const result = await fetchCoverLetters();
      if (result.error) {
        setError(result.error);
      } else {
        setCoverLetters(result.data || []);
      }
      setLoading(false);
    };
    loadCoverLetters();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cover letter?')) return;

    const result = await deleteCoverLetter(id);
    if (result.error) {
      setError(result.error);
    } else {
      setCoverLetters(coverLetters.filter((cl) => cl.id !== id));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate completeness score based on filled content
  const getCompletenessScore = (coverLetter: CoverLetter): number => {
    const content = coverLetter.content as CoverLetterContent;
    const sections = ['subject', 'greeting', 'opening', 'body', 'closing', 'signature'];
    const filledSections = sections.filter((s) => content?.[s as keyof CoverLetterContent]?.trim());
    const hasJobContext = !!(coverLetter.job_context?.company || coverLetter.job_context?.position);
    const hasAIGenerated = !!coverLetter.ai_metadata;

    // Weight: content (60%), job context (20%), AI generated (20%)
    const contentScore = (filledSections.length / sections.length) * 60;
    const contextScore = hasJobContext ? 20 : 0;
    const aiScore = hasAIGenerated ? 20 : 0;

    return Math.round(contentScore + contextScore + aiScore);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{translations.coverLetter.title}</h1>
          <p className="text-muted-foreground">{translations.coverLetter.subtitle}</p>
        </div>
        <Link href="/cover-letter/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {translations.coverLetter.newCoverLetter}
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      {/* Cover Letter List */}
      {coverLetters.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>{translations.coverLetter.noCoverLettersYet}</CardTitle>
            <CardDescription className="mx-auto max-w-md">
              {translations.coverLetter.noCoverLettersDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/cover-letter/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {translations.coverLetter.createCoverLetter}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coverLetters.map((coverLetter) => {
            const completeness = getCompletenessScore(coverLetter);
            return (
              <Card
                key={coverLetter.id}
                className="group relative transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{coverLetter.name}</CardTitle>
                        {coverLetter.job_context?.company && (
                          <p className="text-sm text-muted-foreground">
                            {coverLetter.job_context.company}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative z-10 h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/cover-letter/${coverLetter.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {translations.coverLetter.open}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(coverLetter.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {translations.common.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(coverLetter.content as CoverLetterContent)?.subject && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {(coverLetter.content as CoverLetterContent).subject}
                      </p>
                    )}

                    {/* Completeness indicator */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{completeness}%</span>
                        <span
                          className={
                            completeness >= 80
                              ? 'text-green-600'
                              : completeness >= 50
                                ? 'text-amber-600'
                                : 'text-muted-foreground'
                          }
                        >
                          {completeness >= 80 ? '✓' : ''}
                        </span>
                      </div>
                      <Progress value={completeness} className="h-1.5" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {coverLetter.language === 'de'
                          ? translations.coverLetter.german
                          : translations.coverLetter.english}
                      </Badge>
                      {coverLetter.ai_metadata && (
                        <Badge variant="secondary" className="text-xs">
                          {translations.coverLetter.aiGenerated}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {translations.coverLetter.updated} {formatDate(coverLetter.updated_at)}
                    </div>
                  </div>
                </CardContent>

                {/* Clickable overlay */}
                <Link
                  href={`/cover-letter/${coverLetter.id}`}
                  className="absolute inset-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  style={{ zIndex: 0 }}
                >
                  <span className="sr-only">
                    {translations.coverLetter.open} {coverLetter.name}
                  </span>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
