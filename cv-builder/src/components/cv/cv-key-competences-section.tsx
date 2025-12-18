'use client';

import { Award, ChevronDown, ChevronRight, RotateCcw,Star } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CVKeyCompetenceWithSelection } from '@/types/profile-career.types';

interface CVKeyCompetencesSectionProps {
  cvId: string;
  keyCompetences: CVKeyCompetenceWithSelection[];
  onChange: (keyCompetences: CVKeyCompetenceWithSelection[]) => void;
  language?: 'en' | 'de';
  showKeyCompetences?: boolean;
  onShowKeyCompetencesChange: (show: boolean) => void;
}

export function CVKeyCompetencesSection({
  keyCompetences,
  onChange,
  language = 'en',
  showKeyCompetences = true,
  onShowKeyCompetencesChange,
}: CVKeyCompetencesSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const labels = {
    title: language === 'de' ? 'Kernkompetenzen' : 'Key Competences',
    description:
      language === 'de'
        ? 'Wählen Sie aus, welche Kernkompetenzen in diesem CV angezeigt werden sollen'
        : 'Select which key competences to include in this CV',
    descriptionOverride: language === 'de' ? 'Beschreibung anpassen' : 'Customize Description',
    resetToProfile: language === 'de' ? 'Auf Profil zurücksetzen' : 'Reset to Profile',
    noKeyCompetences:
      language === 'de'
        ? 'Keine Kernkompetenzen im Profil gefunden. Fügen Sie Kernkompetenzen in Ihrem Profil hinzu.'
        : 'No key competences found in your profile. Add key competences in your profile.',
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
      keyCompetences.map((comp) =>
        comp.id === id
          ? { ...comp, selection: { ...comp.selection, is_selected: isSelected } }
          : comp
      )
    );
  };

  const handleFavoriteToggle = (id: string) => {
    onChange(
      keyCompetences.map((comp) =>
        comp.id === id
          ? { ...comp, selection: { ...comp.selection, is_favorite: !comp.selection.is_favorite } }
          : comp
      )
    );
  };

  const handleDescriptionOverrideChange = (id: string, description: string | null) => {
    onChange(
      keyCompetences.map((comp) =>
        comp.id === id
          ? { ...comp, selection: { ...comp.selection, description_override: description } }
          : comp
      )
    );
  };

  if (keyCompetences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {labels.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="show-key-comp" className="text-sm text-muted-foreground">
                {labels.showInCV}
              </Label>
              <Switch
                id="show-key-comp"
                checked={showKeyCompetences}
                onCheckedChange={onShowKeyCompetencesChange}
              />
            </div>
          </div>
          <CardDescription>{labels.noKeyCompetences}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={!showKeyCompetences ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {labels.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="show-key-comp" className="text-sm text-muted-foreground">
              {labels.showInCV}
            </Label>
            <Switch
              id="show-key-comp"
              checked={showKeyCompetences}
              onCheckedChange={onShowKeyCompetencesChange}
            />
          </div>
        </div>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      {showKeyCompetences && (
        <CardContent className="space-y-3">
          {keyCompetences.map((comp) => {
            const isExpanded = expandedIds.has(comp.id);

            return (
              <div
                key={comp.id}
                className={`rounded-lg border transition-colors ${
                  comp.selection.is_selected ? 'bg-background' : 'bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 p-3">
                  {/* Selection Checkbox */}
                  <Checkbox
                    checked={comp.selection.is_selected}
                    onCheckedChange={(checked) => handleSelectionChange(comp.id, !!checked)}
                    className="mt-1"
                  />

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate font-medium">{comp.title}</h4>
                      {comp.selection.is_favorite && (
                        <Star className="h-4 w-4 flex-shrink-0 fill-yellow-500 text-yellow-500" />
                      )}
                    </div>
                    {comp.description && (
                      <p className="line-clamp-1 text-sm text-muted-foreground">
                        {comp.selection.description_override ?? comp.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFavoriteToggle(comp.id)}
                      title={comp.selection.is_favorite ? labels.removeFavorite : labels.favorite}
                      className="h-8 w-8 p-0"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          comp.selection.is_favorite
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
                          onClick={() => toggleExpand(comp.id)}
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
                          {comp.selection.description_override !== null && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDescriptionOverrideChange(comp.id, null)}
                              className="h-7 gap-1 text-xs"
                            >
                              <RotateCcw className="h-3 w-3" />
                              {labels.resetToProfile}
                            </Button>
                          )}
                        </div>
                        <Textarea
                          value={comp.selection.description_override ?? comp.description ?? ''}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            // Set to null if it matches the original profile description
                            handleDescriptionOverrideChange(
                              comp.id,
                              newValue === (comp.description ?? '') ? null : newValue
                            );
                          }}
                          placeholder={comp.description || 'No description in profile'}
                          rows={3}
                          className={
                            comp.selection.description_override !== null ? 'border-primary' : ''
                          }
                        />
                        {comp.selection.description_override !== null && (
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
