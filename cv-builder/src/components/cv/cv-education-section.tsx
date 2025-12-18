'use client';

import { ChevronDown, ChevronRight, GraduationCap, RotateCcw,Star } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { formatDateRange } from '@/lib/utils';
import type { CVEducationWithSelection } from '@/types/profile-career.types';

interface CVEducationSectionProps {
  cvId: string;
  educations: CVEducationWithSelection[];
  onChange: (educations: CVEducationWithSelection[]) => void;
  language?: 'en' | 'de';
  showEducation?: boolean;
  onShowEducationChange: (show: boolean) => void;
}

export function CVEducationSection({
  educations,
  onChange,
  language = 'en',
  showEducation = true,
  onShowEducationChange,
}: CVEducationSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const labels = {
    title: language === 'de' ? 'Ausbildung' : 'Education',
    description:
      language === 'de'
        ? 'Wählen Sie aus, welche Ausbildungen in diesem CV angezeigt werden sollen'
        : 'Select which education entries to include in this CV',
    descriptionOverride: language === 'de' ? 'Beschreibung anpassen' : 'Customize Description',
    resetToProfile: language === 'de' ? 'Auf Profil zurücksetzen' : 'Reset to Profile',
    noEducations:
      language === 'de'
        ? 'Keine Ausbildung im Profil gefunden. Fügen Sie Ausbildung in Ihrem Profil hinzu.'
        : 'No education found in your profile. Add education in your profile.',
    favorite: language === 'de' ? 'Favorit' : 'Favorite',
    removeFavorite: language === 'de' ? 'Favorit entfernen' : 'Remove from favorites',
    customize: language === 'de' ? 'Anpassen' : 'Customize',
    showInCV: language === 'de' ? 'Im CV anzeigen' : 'Show in CV',
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
      educations.map((edu) =>
        edu.id === id ? { ...edu, selection: { ...edu.selection, is_selected: isSelected } } : edu
      )
    );
  };

  const handleFavoriteToggle = (id: string) => {
    onChange(
      educations.map((edu) =>
        edu.id === id
          ? { ...edu, selection: { ...edu.selection, is_favorite: !edu.selection.is_favorite } }
          : edu
      )
    );
  };

  const handleDescriptionOverrideChange = (id: string, description: string | null) => {
    onChange(
      educations.map((edu) =>
        edu.id === id
          ? { ...edu, selection: { ...edu.selection, description_override: description } }
          : edu
      )
    );
  };

  if (educations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              {labels.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="show-education" className="text-sm text-muted-foreground">
                {labels.showInCV}
              </Label>
              <Switch
                id="show-education"
                checked={showEducation}
                onCheckedChange={onShowEducationChange}
              />
            </div>
          </div>
          <CardDescription>{labels.noEducations}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={!showEducation ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {labels.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="show-education" className="text-sm text-muted-foreground">
              {labels.showInCV}
            </Label>
            <Switch
              id="show-education"
              checked={showEducation}
              onCheckedChange={onShowEducationChange}
            />
          </div>
        </div>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      {showEducation && (
        <CardContent className="space-y-3">
          {educations.map((edu) => {
            const isExpanded = expandedIds.has(edu.id);

            return (
              <div
                key={edu.id}
                className={`rounded-lg border transition-colors ${
                  edu.selection.is_selected ? 'bg-background' : 'bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 p-3">
                  {/* Selection Checkbox */}
                  <Checkbox
                    checked={edu.selection.is_selected}
                    onCheckedChange={(checked) => handleSelectionChange(edu.id, !!checked)}
                    className="mt-1"
                  />

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate font-medium">{edu.degree}</h4>
                      {edu.selection.is_favorite && (
                        <Star className="h-4 w-4 flex-shrink-0 fill-yellow-500 text-yellow-500" />
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {edu.institution}
                      {edu.field && ` \u2022 ${edu.field}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateRange(edu.start_date, edu.end_date)}
                      {edu.grade && ` \u2022 ${edu.grade}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFavoriteToggle(edu.id)}
                      title={edu.selection.is_favorite ? labels.removeFavorite : labels.favorite}
                      className="h-8 w-8 p-0"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          edu.selection.is_favorite
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </Button>
                    <Collapsible open={isExpanded}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(edu.id)}
                          title={labels.customize}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </Collapsible>
                  </div>
                </div>

                {/* Expanded Content */}
                <Collapsible open={isExpanded}>
                  <CollapsibleContent className="px-3 pb-3">
                    <div className="ml-7 space-y-4 border-t pt-3">
                      {/* Description Override */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">{labels.descriptionOverride}</Label>
                          {edu.selection.description_override !== null && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDescriptionOverrideChange(edu.id, null)}
                              className="h-7 gap-1 text-xs"
                            >
                              <RotateCcw className="h-3 w-3" />
                              {labels.resetToProfile}
                            </Button>
                          )}
                        </div>
                        <Textarea
                          value={edu.selection.description_override ?? edu.description ?? ''}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            // Set to null if it matches the original profile description
                            handleDescriptionOverrideChange(
                              edu.id,
                              newValue === (edu.description ?? '') ? null : newValue
                            );
                          }}
                          placeholder={edu.description || 'No description in profile'}
                          rows={3}
                          className={
                            edu.selection.description_override !== null ? 'border-primary' : ''
                          }
                        />
                        {edu.selection.description_override !== null && (
                          <p className="text-xs text-muted-foreground">
                            *{' '}
                            {language === 'de'
                              ? 'Angepasste Beschreibung für diesen CV'
                              : 'Custom description for this CV'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
