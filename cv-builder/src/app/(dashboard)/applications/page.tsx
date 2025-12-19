'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  Briefcase,
  ExternalLink,
  LayoutGrid,
  MoreVertical,
  Plus,
  Search,
  Star,
  Table as TableIcon,
  Trash2,
  Wand2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusChangeAnimation } from '@/components/animations/status-change-animation';
import {
  ApplicationCardOverlay,
  DraggableApplicationCard,
  DroppableColumn,
  generateFakeApplication,
  KANBAN_LAYOUT,
  STATUS_ICONS,
} from '@/components/applications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/auth-context';
import {
  createApplication,
  deleteApplication,
  fetchApplications,
  toggleApplicationFavorite,
  updateApplicationStatus,
} from '@/services/application.service';
import type { ApplicationStatus, JobApplication } from '@/types/cv.types';
import { APPLICATION_STATUS_CONFIG } from '@/types/cv.types';

type ViewMode = 'kanban' | 'table';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [animatingStatus, setAnimatingStatus] = useState<ApplicationStatus | null>(null);

  // Set up drag sensors with a small activation distance to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadApplications = async () => {
    const result = await fetchApplications();
    if (result.error) {
      setError(result.error);
    } else {
      setApplications(result.data || []);
    }
    setLoading(false);
  };

  // Load applications when user is available (wait for auth to be ready)
  useEffect(() => {
    if (user) {
      // Valid pattern: data fetching on user change
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadApplications();
    }
  }, [user]);

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
    // Trigger animation for the new status
    setAnimatingStatus(newStatus);

    const result = await updateApplicationStatus(id, newStatus);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setApplications(applications.map((app) => (app.id === id ? result.data! : app)));
    }
  };

  const handleAutoGenerate = async () => {
    const fakeData = generateFakeApplication();
    const result = await createApplication(fakeData);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setApplications((prev) => [result.data!, ...prev]);
      // Trigger animation for the new status
      setAnimatingStatus(result.data.status);
    }
  };

  const handleToggleFavorite = async (id: string, currentFavorite: boolean) => {
    // Optimistically update the UI
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, is_favorite: !currentFavorite } : app))
    );

    const result = await toggleApplicationFavorite(id, !currentFavorite);
    if (result.error) {
      // Revert on error
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, is_favorite: currentFavorite } : app))
      );
      setError(result.error);
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredApplications = applications.filter((app) => {
    // Filter by favorites if enabled
    if (showFavoritesOnly && !app.is_favorite) return false;

    // Filter by search query
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

  const activeApplication = activeId ? applications.find((app) => app.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const applicationId = active.id as string;
    const newStatus = over.id as ApplicationStatus;

    // Find the application being dragged
    const application = applications.find((app) => app.id === applicationId);
    if (!application || application.status === newStatus) return;

    // Optimistically update the UI
    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
    );

    // Update on the server
    handleStatusChange(applicationId, newStatus);
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
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-96 w-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Status change animation */}
      <StatusChangeAnimation status={animatingStatus} onComplete={() => setAnimatingStatus(null)} />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">Track and manage your job applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleAutoGenerate}>
            <Wand2 className="h-4 w-4" />
            Auto-generate
          </Button>
          <Link href="/applications/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="gap-2"
          >
            <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites
          </Button>
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
        <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Empty State */}
      {applications.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>No applications yet</CardTitle>
            <CardDescription className="mx-auto max-w-md">
              Start tracking your job applications. Add positions you&apos;re interested in and
              track your progress through the hiring process.
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
        /* Kanban View - Scrollable container for columns only */
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 pb-4">
              {KANBAN_LAYOUT.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className="flex w-72 flex-shrink-0 flex-col gap-4 border-r border-border/50 pr-4 last:border-r-0 last:pr-0"
                >
                  {column.statuses.map((status) => {
                    const statusConfig = APPLICATION_STATUS_CONFIG[status];
                    const statusApplications = getApplicationsByStatus(status);
                    const StatusIcon = STATUS_ICONS[statusConfig.icon];

                    // Get explicit color class for icons
                    const iconColorClass =
                      status === 'accepted'
                        ? 'text-emerald-600'
                        : status === 'rejected'
                          ? 'text-red-600'
                          : statusConfig.color;

                    return (
                      <DroppableColumn key={status} status={status} stacked={column.stacked}>
                        <div className="mb-3 flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${iconColorClass}`} />
                          <h3 className="font-medium">{statusConfig.label}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {statusApplications.length}
                          </Badge>
                        </div>
                        <div
                          className={`rounded-lg p-2 ${column.stacked ? 'min-h-[180px]' : 'min-h-[400px]'} ${statusConfig.bgColor}/30`}
                        >
                          <div className="space-y-2">
                            {statusApplications.map((app) => (
                              <DraggableApplicationCard
                                key={app.id}
                                application={app}
                                onDelete={handleDelete}
                                onStatusChange={handleStatusChange}
                                onToggleFavorite={handleToggleFavorite}
                                isDragging={activeId === app.id}
                              />
                            ))}
                          </div>
                        </div>
                      </DroppableColumn>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <DragOverlay>
            {activeApplication ? <ApplicationCardOverlay application={activeApplication} /> : null}
          </DragOverlay>
        </DndContext>
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
                const StatusIcon = STATUS_ICONS[statusConfig.icon];
                // Get explicit color class for icons
                const iconColorClass =
                  app.status === 'accepted'
                    ? 'text-emerald-600'
                    : app.status === 'rejected'
                      ? 'text-red-600'
                      : statusConfig.color;
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
                    <TableCell className="text-muted-foreground">{app.location || '-'}</TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.bgColor} ${iconColorClass} gap-1`}>
                        <StatusIcon className="h-3 w-3" />
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
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open
                            </Link>
                          </DropdownMenuItem>
                          {app.job_url && (
                            <DropdownMenuItem asChild>
                              <a href={app.job_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Job Posting
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(app.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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
