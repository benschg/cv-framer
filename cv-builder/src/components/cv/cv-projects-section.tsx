'use client';

import { ChevronDown, ChevronRight, FolderKanban, RotateCcw,Star } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { formatDateRange } from '@/lib/utils';
import type { CVProjectWithSelection } from '@/types/profile-career.types';

interface CVProjectsSectionProps {
  cvId: string;
  projects: CVProjectWithSelection[];
  onChange: (projects: CVProjectWithSelection[]) => void;
  language?: 'en' | 'de';
  showProjects?: boolean;
  onShowProjectsChange: (show: boolean) => void;
}

export function CVProjectsSection({
  projects,
  onChange,
  language = 'en',
  showProjects = true,
  onShowProjectsChange,
}: CVProjectsSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const labels = {
    title: language === 'de' ? 'Projekte' : 'Projects',
    description:
      language === 'de'
        ? 'Wählen Sie aus, welche Projekte in diesem CV angezeigt werden sollen'
        : 'Select which projects to include in this CV',
    descriptionOverride: language === 'de' ? 'Beschreibung anpassen' : 'Customize Description',
    resetToProfile: language === 'de' ? 'Auf Profil zurücksetzen' : 'Reset to Profile',
    noProjects:
      language === 'de'
        ? 'Keine Projekte im Profil gefunden. Fügen Sie Projekte in Ihrem Profil hinzu.'
        : 'No projects found in your profile. Add projects in your profile.',
    favorite: language === 'de' ? 'Favorit' : 'Favorite',
    removeFavorite: language === 'de' ? 'Favorit entfernen' : 'Remove from favorites',
    customize: language === 'de' ? 'Anpassen' : 'Customize',
    showInCV: language === 'de' ? 'Im CV anzeigen' : 'Show in CV',
    role: language === 'de' ? 'Rolle' : 'Role',
    technologies: language === 'de' ? 'Technologien' : 'Technologies',
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectionChange = (id: string, isSelected: boolean) => {
    onChange(
      projects.map((project) =>
        project.id === id
          ? { ...project, selection: { ...project.selection, is_selected: isSelected } }
          : project
      )
    );
  };

  const handleFavoriteToggle = (id: string) => {
    onChange(
      projects.map((project) =>
        project.id === id
          ? {
              ...project,
              selection: { ...project.selection, is_favorite: !project.selection.is_favorite },
            }
          : project
      )
    );
  };

  const handleDescriptionOverrideChange = (id: string, description: string | null) => {
    onChange(
      projects.map((project) =>
        project.id === id
          ? { ...project, selection: { ...project.selection, description_override: description } }
          : project
      )
    );
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              {labels.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="show-projects" className="text-sm text-muted-foreground">
                {labels.showInCV}
              </Label>
              <Switch
                id="show-projects"
                checked={showProjects}
                onCheckedChange={onShowProjectsChange}
              />
            </div>
          </div>
          <CardDescription>{labels.noProjects}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={!showProjects ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            {labels.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="show-projects" className="text-sm text-muted-foreground">
              {labels.showInCV}
            </Label>
            <Switch
              id="show-projects"
              checked={showProjects}
              onCheckedChange={onShowProjectsChange}
            />
          </div>
        </div>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      {showProjects && (
        <CardContent className="space-y-3">
          {projects.map((project) => {
            const isExpanded = expandedIds.has(project.id);
            const dateRange = formatDateRange(
              project.start_date || '',
              project.end_date || '',
              project.current || false
            );

            return (
              <div
                key={project.id}
                className={`rounded-lg border transition-colors ${
                  project.selection.is_selected ? 'bg-background' : 'bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 p-3">
                  {/* Selection Checkbox */}
                  <div className="pt-0.5">
                    <Checkbox
                      checked={project.selection.is_selected}
                      onCheckedChange={(checked) =>
                        handleSelectionChange(project.id, checked as boolean)
                      }
                    />
                  </div>

                  {/* Project Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium">{project.name}</h4>
                        {project.role && (
                          <p className="text-sm text-muted-foreground">
                            {labels.role}: {project.role}
                          </p>
                        )}
                        {dateRange && <p className="text-sm text-muted-foreground">{dateRange}</p>}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {project.technologies.map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Favorite and Expand Buttons */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFavoriteToggle(project.id)}
                          className="h-8 w-8 p-0"
                          title={
                            project.selection.is_favorite ? labels.removeFavorite : labels.favorite
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${
                              project.selection.is_favorite
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(project.id)}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Section */}
                    {isExpanded && (
                      <div className="mt-3 space-y-3 border-t pt-3">
                        {/* Original Description */}
                        {project.description && (
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              {language === 'de' ? 'Profilbeschreibung' : 'Profile Description'}
                            </Label>
                            <p className="mt-1 text-sm">{project.description}</p>
                          </div>
                        )}

                        {/* Outcome */}
                        {project.outcome && (
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              {language === 'de' ? 'Ergebnis' : 'Outcome'}
                            </Label>
                            <p className="mt-1 text-sm">{project.outcome}</p>
                          </div>
                        )}

                        {/* Description Override */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`desc-${project.id}`} className="text-sm">
                              {labels.descriptionOverride}
                            </Label>
                            {project.selection.description_override && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDescriptionOverrideChange(project.id, null)}
                                className="h-auto px-2 py-1"
                              >
                                <RotateCcw className="mr-1 h-3 w-3" />
                                {labels.resetToProfile}
                              </Button>
                            )}
                          </div>
                          <Textarea
                            id={`desc-${project.id}`}
                            value={project.selection.description_override || ''}
                            onChange={(e) =>
                              handleDescriptionOverrideChange(project.id, e.target.value || null)
                            }
                            placeholder={project.description || ''}
                            rows={3}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
