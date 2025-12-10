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
import type { CVDocument } from '@/types/cv.types';

export default function CVDashboardPage() {
  const [cvs, setCvs] = useState<CVDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!confirm('Are you sure you want to delete this CV?')) return;
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
    return new Date(dateString).toLocaleDateString('en-US', {
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
          <h1 className="text-3xl font-bold tracking-tight">My CVs</h1>
          <p className="text-muted-foreground">
            Create and manage your professional CVs
          </p>
        </div>
        <Link href="/cv/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New CV
          </Button>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CVs Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cvs.length}</div>
            <p className="text-xs text-muted-foreground">
              {cvs.length === 0 ? 'Start building your first CV' : 'Total CVs in your account'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Werbeflaechen</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              Profile completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cover Letters</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Generated letters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Active applications
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
                Fill Out Werbeflaechen
              </CardTitle>
              <CardDescription>
                Complete your self-marketing profile to generate better CVs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/werbeflaechen">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Create Your First CV
              </CardTitle>
              <CardDescription>
                Build a professional CV with AI-powered customization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/cv/new">
                <Button variant="outline" className="w-full">
                  Create CV
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Generate Cover Letter
              </CardTitle>
              <CardDescription>
                Create tailored cover letters for your job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/cover-letter">
                <Button variant="outline" className="w-full">
                  Write Letter
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
                          Default
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
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(cv.id, cv.name)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {!cv.is_default && (
                        <DropdownMenuItem onClick={() => handleSetDefault(cv.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(cv.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {cv.job_context?.company || cv.job_context?.position || 'General CV'}
                  </span>
                  <span>{formatDate(cv.updated_at)}</span>
                </div>
                <div className="mt-4">
                  <Link href={`/cv/${cv.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Open Editor
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
