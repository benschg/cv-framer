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
import { useDraggable, useDroppable } from '@dnd-kit/core';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  FileEdit,
  Gift,
  LayoutGrid,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Send,
  Star,
  Table as TableIcon,
  Trash2,
  Undo2,
  Users,
  Wand2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { StatusChangeAnimation } from '@/components/animations/status-change-animation';
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

// Kanban column layout - some columns are stacked vertically
type KanbanColumn = {
  statuses: ApplicationStatus[];
  stacked?: boolean;
};

const KANBAN_LAYOUT: KanbanColumn[] = [
  { statuses: ['draft'] },
  { statuses: ['applied'] },
  { statuses: ['screening', 'interview', 'offer'], stacked: true },
  { statuses: ['accepted', 'rejected'], stacked: true },
];

// All statuses for the dropdown menu
const ALL_STATUSES: ApplicationStatus[] = [
  'draft',
  'applied',
  'screening',
  'interview',
  'offer',
  'accepted',
  'rejected',
];

// Icon map for status icons
const STATUS_ICONS = {
  FileEdit,
  Send,
  Search,
  Users,
  Gift,
  CheckCircle,
  XCircle,
  Undo2,
} as const;

// Fake data for auto-generating applications (dev only)
const FAKE_COMPANIES = [
  'Acme Corp',
  'TechStart Inc',
  'DataFlow Systems',
  'CloudNine Solutions',
  'InnovateTech',
  'PixelPerfect',
  'CodeCraft Labs',
  'DigitalDreams',
  'FutureWorks',
  'ByteSize Co',
  'Quantum Dynamics',
  'NexGen Software',
  'BlueSky Analytics',
  'GreenLeaf Tech',
  'RedRocket Media',
  'SilverStream',
];
const FAKE_TITLES = [
  'Senior Frontend Developer',
  'Full Stack Engineer',
  'React Developer',
  'Software Engineer',
  'Lead Developer',
  'UI/UX Developer',
  'Tech Lead',
  'Junior Developer',
  'Backend Engineer',
  'DevOps Engineer',
  'Platform Engineer',
];
const FAKE_LOCATIONS = [
  'Berlin, Germany',
  'Munich, Germany',
  'Hamburg, Germany',
  'Remote',
  'Frankfurt, Germany',
  'Cologne, Germany',
  'Vienna, Austria',
  'Zurich, Switzerland',
];

function generateFakeApplication() {
  const company = FAKE_COMPANIES[Math.floor(Math.random() * FAKE_COMPANIES.length)];
  const title = FAKE_TITLES[Math.floor(Math.random() * FAKE_TITLES.length)];
  const location = FAKE_LOCATIONS[Math.floor(Math.random() * FAKE_LOCATIONS.length)];
  const status = ALL_STATUSES[Math.floor(Math.random() * ALL_STATUSES.length)];

  return {
    company_name: company,
    job_title: title,
    location,
    status,
    job_description: `We are looking for a ${title} to join our team at ${company}.`,
  };
}

export default function ApplicationsPage() {
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadApplications();
  }, []);

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

// Application Card Component for Kanban View (unused - using DraggableApplicationCard instead)
function _ApplicationCard({
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
    <Card className="group relative transition-shadow hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">{application.company_name}</span>
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">{application.job_title}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative z-10 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/applications/${application.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </Link>
              </DropdownMenuItem>
              {ALL_STATUSES.filter((s) => s !== application.status).map((status) => {
                const config = APPLICATION_STATUS_CONFIG[status];
                const StatusIcon = STATUS_ICONS[config.icon];
                return (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onStatusChange(application.id, status)}
                  >
                    <StatusIcon className="mr-2 h-4 w-4" />
                    Move to {config.label}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(application.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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

// Droppable Column Component for Kanban
function DroppableColumn({
  status,
  stacked,
  children,
}: {
  status: ApplicationStatus;
  stacked?: boolean;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${stacked ? 'flex-1' : ''} transition-all duration-200 ${
        isOver ? 'rounded-lg bg-primary/10' : ''
      }`}
    >
      {children}
    </div>
  );
}

// Draggable Application Card Component
function DraggableApplicationCard({
  application,
  onDelete,
  onStatusChange,
  onToggleFavorite,
  isDragging,
}: {
  application: JobApplication;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onToggleFavorite: (id: string, currentFavorite: boolean) => void;
  isDragging: boolean;
}) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging: isDragActive,
  } = useDraggable({
    id: application.id,
  });
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const isOverdue = application.deadline && new Date(application.deadline) < new Date();

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;

    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only navigate if pointer didn't move much (wasn't a drag)
    // The drag activation threshold is 8px, so we use a similar value
    if (distance < 8 && !isDragActive) {
      router.push(`/applications/${application.id}`);
    }

    pointerStartRef.current = null;
  };

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onPointerDown={(e) => {
        handlePointerDown(e);
        listeners?.onPointerDown?.(e as unknown as PointerEvent);
      }}
      onPointerUp={handlePointerUp}
      className={`group relative cursor-pointer touch-none transition-all hover:shadow-md ${
        isDragging ? 'scale-95 opacity-30' : ''
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">{application.company_name}</span>
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">{application.job_title}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`relative z-10 h-7 w-7 transition-opacity ${
                application.is_favorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(application.id, application.is_favorite);
              }}
            >
              <Star
                className={`h-4 w-4 ${
                  application.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''
                }`}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative z-10 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/applications/${application.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </Link>
                </DropdownMenuItem>
                {ALL_STATUSES.filter((s) => s !== application.status).map((status) => {
                  const config = APPLICATION_STATUS_CONFIG[status];
                  const StatusIcon = STATUS_ICONS[config.icon];
                  return (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => onStatusChange(application.id, status)}
                    >
                      <StatusIcon className="mr-2 h-4 w-4" />
                      Move to {config.label}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(application.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}

// Overlay component shown while dragging
function ApplicationCardOverlay({ application }: { application: JobApplication }) {
  const isOverdue = application.deadline && new Date(application.deadline) < new Date();

  return (
    <Card className="w-72 rotate-3 cursor-grabbing shadow-xl">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">{application.company_name}</span>
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">{application.job_title}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
        </div>
      </CardContent>
    </Card>
  );
}
