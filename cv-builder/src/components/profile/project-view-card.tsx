'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, ExternalLink } from 'lucide-react';
import { formatDateRange } from '@/lib/utils';
import type { ProfileProject } from '@/types/profile-career.types';

interface ProjectViewCardProps {
  project: ProfileProject;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  t: (key: string) => string;
}

export function ProjectViewCard({
  project,
  onEdit,
  onDelete,
  disabled,
  t,
}: ProjectViewCardProps) {
  const dateRange = formatDateRange(
    project.start_date || '',
    project.end_date || '',
    project.current || false
  );

  return (
    <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={onEdit}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium">{project.name}</h3>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            {project.role && (
              <p className="text-sm text-muted-foreground">{project.role}</p>
            )}
            {dateRange && (
              <p className="text-sm text-muted-foreground">{dateRange}</p>
            )}
            {project.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              disabled={disabled}
            >
              {t('profile.projects.editButton')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
