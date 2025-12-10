'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Briefcase,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Search,
  MoreVertical,
  Trash2,
  ExternalLink,
  Calendar,
  Building2,
  MapPin,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchApplications, deleteApplication, updateApplicationStatus } from '@/services/application.service';
import type { JobApplication, ApplicationStatus } from '@/types/cv.types';
import { APPLICATION_STATUS_CONFIG } from '@/types/cv.types';

type ViewMode = 'kanban' | 'table';

// Kanban column order
const KANBAN_COLUMNS: ApplicationStatus[] = [
  'draft',
  'applied',
  'screening',
  'interview',
  'offer',
  'accepted',
  'rejected',
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    const result = await fetchApplications();
    if (result.error) {
      setError(result.error);
    } else {
      setApplications(result.data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    const result = await deleteApplication(id);
    if (result.error) {
      setError(result.error);
    } else {
      setApplications(applications.filter((app) => app.id !== id));
    }
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    const result = await updateApplicationStatus(id, newStatus);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setApplications(applications.map((app) =>
        app.id === id ? result.data! : app
      ));
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.company_name.toLowerCase().includes(query) ||
      app.job_title.toLowerCase().includes(query) ||
      (app.location?.toLowerCase().includes(query) ?? false)
    );
  });

  const getApplicationsByStatus = (status: ApplicationStatus) => {
    return filteredApplications.filter((app) => app.status === status);
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
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-96 w-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        <Link href="/applications/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kanban')}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="gap-2"
          >
            <TableIcon className="h-4 w-4" />
            Table
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Empty State */}
      {applications.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>No applications yet</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Start tracking your job applications. Add positions you&apos;re interested in
              and track your progress through the hiring process.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/applications/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Application
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((status) => {
            const statusConfig = APPLICATION_STATUS_CONFIG[status];
            const statusApplications = getApplicationsByStatus(status);

            return (
              <div
                key={status}
                className="flex-shrink-0 w-72"
              >
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-medium">{statusConfig.label}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {statusApplications.length}
                  </Badge>
                </div>
                <div className={`rounded-lg p-2 min-h-[400px] ${statusConfig.bgColor}/30`}>
                  <div className="space-y-2">
                    {statusApplications.map((app) => (
                      <ApplicationCard
                        key={app.id}
                        application={app}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => {
                const statusConfig = APPLICATION_STATUS_CONFIG[app.status];
                return (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Link
                        href={`/applications/${app.id}`}
                        className="font-medium hover:underline"
                      >
                        {app.company_name}
                      </Link>
                    </TableCell>
                    <TableCell>{app.job_title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {app.location || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(app.applied_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(app.deadline)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/applications/${app.id}`}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open
                            </Link>
                          </DropdownMenuItem>
                          {app.job_url && (
                            <DropdownMenuItem asChild>
                              <a href={app.job_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Job Posting
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(app.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// Application Card Component for Kanban View
function ApplicationCard({
  application,
  onDelete,
  onStatusChange,
}: {
  application: JobApplication;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}) {
  const isOverdue = application.deadline && new Date(application.deadline) < new Date();

  return (
    <Card className="group relative hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{application.company_name}</span>
            </div>
            <p className="text-sm text-muted-foreground truncate mt-1">
              {application.job_title}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity relative z-10"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/applications/${application.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Link>
              </DropdownMenuItem>
              {KANBAN_COLUMNS.filter((s) => s !== application.status).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onStatusChange(application.id, status)}
                >
                  Move to {APPLICATION_STATUS_CONFIG[status].label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(application.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
          {application.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{application.location}</span>
            </div>
          )}
          {application.deadline && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-destructive' : ''}`}>
              <Clock className="h-3 w-3" />
              <span>{new Date(application.deadline).toLocaleDateString()}</span>
            </div>
          )}
          {application.applied_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(application.applied_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Quick link to application */}
        <Link
          href={`/applications/${application.id}`}
          className="absolute inset-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          style={{ zIndex: 0 }}
        >
          <span className="sr-only">Open {application.company_name}</span>
        </Link>
      </CardContent>
    </Card>
  );
}
