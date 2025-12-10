'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mail,
  Plus,
  FileText,
  MoreVertical,
  Trash2,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchCoverLetters, deleteCoverLetter } from '@/services/cover-letter.service';
import type { CoverLetter } from '@/types/cv.types';

export default function CoverLetterListPage() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
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
          <h1 className="text-3xl font-bold tracking-tight">Cover Letters</h1>
          <p className="text-muted-foreground">
            AI-generated cover letters tailored to each job application
          </p>
        </div>
        <Link href="/cover-letter/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Cover Letter
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Cover Letter List */}
      {coverLetters.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>No cover letters yet</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Create your first cover letter to get started. Our AI will help you craft
              compelling, personalized letters based on your profile and the job requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/cover-letter/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Cover Letter
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coverLetters.map((coverLetter) => (
            <Card key={coverLetter.id} className="group relative hover:shadow-md transition-shadow">
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/cover-letter/${coverLetter.id}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(coverLetter.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coverLetter.content?.subject && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {coverLetter.content.subject}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {coverLetter.language === 'de' ? 'Deutsch' : 'English'}
                    </Badge>
                    {coverLetter.ai_metadata && (
                      <Badge variant="secondary" className="text-xs">
                        AI Generated
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Updated {formatDate(coverLetter.updated_at)}
                  </div>
                </div>
              </CardContent>

              {/* Clickable overlay */}
              <Link
                href={`/cover-letter/${coverLetter.id}`}
                className="absolute inset-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                style={{ zIndex: 0 }}
              >
                <span className="sr-only">Open {coverLetter.name}</span>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
