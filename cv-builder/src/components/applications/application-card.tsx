'use client';

import { useDraggable } from '@dnd-kit/core';
import {
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  MoreVertical,
  Star,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ApplicationStatus, JobApplication } from '@/types/cv.types';
import { APPLICATION_STATUS_CONFIG } from '@/types/cv.types';

import { ALL_STATUSES, STATUS_ICONS } from './constants';

interface DraggableApplicationCardProps {
  application: JobApplication;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onToggleFavorite: (id: string, currentFavorite: boolean) => void;
  isDragging: boolean;
}

/**
 * Draggable application card for Kanban view
 */
export function DraggableApplicationCard({
  application,
  onDelete,
  onStatusChange,
  onToggleFavorite,
  isDragging,
}: DraggableApplicationCardProps) {
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

interface ApplicationCardOverlayProps {
  application: JobApplication;
}

/**
 * Overlay component shown while dragging an application card
 */
export function ApplicationCardOverlay({ application }: ApplicationCardOverlayProps) {
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
