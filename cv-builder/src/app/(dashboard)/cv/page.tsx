'use client';

import {
  Copy,
  Download,
  Edit,
  ExternalLink,
  FileText,
  Grid3x3,
  List,
  MoreVertical,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CVThumbnail } from '@/components/cv/cv-thumbnail';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppLanguage } from '@/hooks/use-app-language';
import { useTranslations } from '@/hooks/use-translations';
import { deleteCV, duplicateCV, fetchAllCVs, updateCV } from '@/services/cv.service';
import type { CVDocument } from '@/types/cv.types';

export default function CVDashboardPage() {
  const [cvs, setCvs] = useState<CVDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { language } = useAppLanguage();
  const { translations } = useTranslations(language);

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
      setCvs(cvs.filter((cv) => cv.id !== id));
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
      setCvs(
        cvs.map((cv) => ({
          ...cv,
          is_default: cv.id === id,
        }))
      );
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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{translations.cv.myCVs}</h1>
          <p className="text-muted-foreground">
            {cvs.length === 0
              ? translations.cv.subtitle
              : `${cvs.length} ${cvs.length === 1 ? 'CV' : 'CVs'}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {cvs.length > 0 && (
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
              <TabsList>
                <TabsTrigger value="grid" className="gap-1">
                  <Grid3x3 className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:inline">Grid</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-1">
                  <List className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:inline">List</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <Link href="/cv/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {translations.cv.newCV}
            </Button>
          </Link>
        </div>
      </div>

      {/* CV List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="aspect-[1/1.414] w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">{translations.cv.createFirstCV}</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              {translations.cv.buildProfessional}
            </p>
            <Link href="/cv/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {translations.cv.createCV}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cvs.map((cv) => (
            <Card key={cv.id} className="group overflow-visible">
              <CardHeader className="overflow-visible p-0">
                <Link href={`/cv/${cv.id}`} className="block">
                  <CVThumbnail cv={cv} />
                </Link>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link href={`/cv/${cv.id}`}>
                      <h3 className="truncate font-semibold hover:text-primary">{cv.name}</h3>
                    </Link>
                    {cv.is_default && (
                      <Badge variant="secondary" className="mt-1">
                        <Star className="mr-1 h-3 w-3 fill-current" />
                        {translations.cv.default}
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/cv/${cv.id}`} className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          {translations.common.edit}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(cv.id, cv.name)}>
                        <Copy className="mr-2 h-4 w-4" />
                        {translations.cv.duplicate}
                      </DropdownMenuItem>
                      {!cv.is_default && (
                        <DropdownMenuItem onClick={() => handleSetDefault(cv.id)}>
                          <Star className="mr-2 h-4 w-4" />
                          {translations.cv.setAsDefault}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(cv.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {translations.common.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {cv.description && (
                  <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                    {cv.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">
                    {cv.job_context?.company ||
                      cv.job_context?.position ||
                      translations.cv.generalCV}
                  </span>
                  <span className="shrink-0">{formatDate(cv.updated_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {cvs.map((cv) => (
            <Card key={cv.id} className="group overflow-visible">
              <CardContent className="flex items-center gap-4 p-4">
                <Link href={`/cv/${cv.id}`} className="shrink-0">
                  <CVThumbnail cv={cv} className="h-24 w-[68px]" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Link href={`/cv/${cv.id}`}>
                      <h3 className="truncate font-semibold hover:text-primary">{cv.name}</h3>
                    </Link>
                    {cv.is_default && (
                      <Badge variant="secondary">
                        <Star className="mr-1 h-3 w-3 fill-current" />
                        {translations.cv.default}
                      </Badge>
                    )}
                  </div>
                  {cv.description && (
                    <p className="mb-2 line-clamp-1 text-sm text-muted-foreground">
                      {cv.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="truncate">
                      {cv.job_context?.company ||
                        cv.job_context?.position ||
                        translations.cv.generalCV}
                    </span>
                    <span>•</span>
                    <span>{formatDate(cv.updated_at)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/cv/${cv.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">{translations.common.edit}</span>
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/cv/${cv.id}`} className="flex items-center">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {translations.cv.openEditor}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(cv.id, cv.name)}>
                        <Copy className="mr-2 h-4 w-4" />
                        {translations.cv.duplicate}
                      </DropdownMenuItem>
                      {!cv.is_default && (
                        <DropdownMenuItem onClick={() => handleSetDefault(cv.id)}>
                          <Star className="mr-2 h-4 w-4" />
                          {translations.cv.setAsDefault}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(cv.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {translations.common.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
