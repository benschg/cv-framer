'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  FileText,
  Target,
  Mail,
  Briefcase,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Star,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchAllCVs, deleteCV, duplicateCV, updateCV } from '@/services/cv.service';
import { useTranslations } from '@/hooks/use-translations';
import type { CVDocument } from '@/types/cv.types';

export default function CVDashboardPage() {
  const [cvs, setCvs] = useState<CVDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const { translations } = useTranslations(language);

  // Load language preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('app-language');
    if (saved === 'en' || saved === 'de') {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    const loadCVs = async () => {
      const result = await fetchAllCVs();
      if (result.error) {
        setError(result.error);
      } else {
        setCvs(result.data || []);
      }
      setLoading(false);
    };
    loadCVs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(translations.cv.confirmDelete)) return;
    const result = await deleteCV(id);
    if (result.data) {
      setCvs(cvs.filter(cv => cv.id !== id));
    }
  };

  const handleDuplicate = async (id: string, name: string) => {
    const result = await duplicateCV(id, `${name} (Copy)`);
    if (result.data) {
      setCvs([result.data, ...cvs]);
    }
  };

  const handleSetDefault = async (id: string) => {
    const result = await updateCV(id, { is_default: true });
    if (result.data) {
      setCvs(cvs.map(cv => ({
        ...cv,
        is_default: cv.id === id,
      })));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{translations.cv.myCVs}</h1>
          <p className="text-muted-foreground">
            {translations.cv.subtitle}
          </p>
        </div>
        <Link href="/cv/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {translations.cv.newCV}
          </Button>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translations.cv.cvsCreated}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cvs.length}</div>
            <p className="text-xs text-muted-foreground">
              {cvs.length === 0 ? translations.cv.startBuilding : translations.cv.totalCVs}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translations.nav.werbeflaechen}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              {translations.cv.profileCompletion}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translations.nav.coverLetter}</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {translations.cv.generatedLetters}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translations.nav.applications}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {translations.cv.activeApplications}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CV List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : cvs.length === 0 ? (
        /* Empty state */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {translations.cv.fillOutWerbeflaechen}
              </CardTitle>
              <CardDescription>
                {translations.cv.completeProfile}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/werbeflaechen">
                <Button variant="outline" className="w-full">
                  {translations.cv.getStarted}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {translations.cv.createFirstCV}
              </CardTitle>
              <CardDescription>
                {translations.cv.buildProfessional}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/cv/new">
                <Button variant="outline" className="w-full">
                  {translations.cv.createCV}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {translations.cv.generateCoverLetter}
              </CardTitle>
              <CardDescription>
                {translations.cv.createTailored}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/cover-letter">
                <Button variant="outline" className="w-full">
                  {translations.cv.writeLetter}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* CV List */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cvs.map((cv) => (
            <Card key={cv.id} className="group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="truncate">{cv.name}</CardTitle>
                      {cv.is_default && (
                        <Badge variant="secondary" className="shrink-0">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {translations.cv.default}
                        </Badge>
                      )}
                    </div>
                    {cv.description && (
                      <CardDescription className="line-clamp-1 mt-1">
                        {cv.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/cv/${cv.id}`} className="flex items-center">
                          <Edit className="h-4 w-4 mr-2" />
                          {translations.common.edit}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(cv.id, cv.name)}>
                        <Copy className="h-4 w-4 mr-2" />
                        {translations.cv.duplicate}
                      </DropdownMenuItem>
                      {!cv.is_default && (
                        <DropdownMenuItem onClick={() => handleSetDefault(cv.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          {translations.cv.setAsDefault}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(cv.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {translations.common.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {cv.job_context?.company || cv.job_context?.position || translations.cv.generalCV}
                  </span>
                  <span>{formatDate(cv.updated_at)}</span>
                </div>
                <div className="mt-4">
                  <Link href={`/cv/${cv.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      {translations.cv.openEditor}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
