'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Briefcase,
  Star,
  ChevronDown,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { formatDateRange } from '@/lib/utils';
import type { CVWorkExperienceWithSelection } from '@/types/profile-career.types';

interface CVWorkExperienceSectionProps {
  cvId: string;
  workExperiences: CVWorkExperienceWithSelection[];
  onChange: (experiences: CVWorkExperienceWithSelection[]) => void;
  language?: 'en' | 'de';
}

export function CVWorkExperienceSection({
  workExperiences,
  onChange,
  language = 'en',
}: CVWorkExperienceSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const labels = {
    title: language === 'de' ? 'Berufserfahrung' : 'Work Experience',
    description: language === 'de'
      ? 'Wählen Sie aus, welche Erfahrungen in diesem CV angezeigt werden sollen'
      : 'Select which experiences to include in this CV',
    descriptionOverride: language === 'de' ? 'Beschreibung anpassen' : 'Customize Description',
    selectBullets: language === 'de' ? 'Aufzählungspunkte auswählen' : 'Select Bullet Points',
    resetToProfile: language === 'de' ? 'Auf Profil zurücksetzen' : 'Reset to Profile',
    noExperiences: language === 'de'
      ? 'Keine Berufserfahrung im Profil gefunden. Fügen Sie Berufserfahrung in Ihrem Profil hinzu.'
      : 'No work experience found in your profile. Add work experience in your profile.',
    favorite: language === 'de' ? 'Favorit' : 'Favorite',
    removeFavorite: language === 'de' ? 'Favorit entfernen' : 'Remove from favorites',
    customize: language === 'de' ? 'Anpassen' : 'Customize',
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
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
    onChange(workExperiences.map(exp =>
      exp.id === id
        ? { ...exp, selection: { ...exp.selection, is_selected: isSelected } }
        : exp
    ));
  };

  const handleFavoriteToggle = (id: string) => {
    onChange(workExperiences.map(exp =>
      exp.id === id
        ? { ...exp, selection: { ...exp.selection, is_favorite: !exp.selection.is_favorite } }
        : exp
    ));
  };

  const handleDescriptionOverrideChange = (id: string, description: string | null) => {
    onChange(workExperiences.map(exp =>
      exp.id === id
        ? { ...exp, selection: { ...exp.selection, description_override: description } }
        : exp
    ));
  };

  const handleBulletSelectionChange = (id: string, bulletIndex: number, isSelected: boolean) => {
    onChange(workExperiences.map(exp => {
      if (exp.id !== id) return exp;

      const currentIndices = exp.selection.selected_bullet_indices;
      let newIndices: number[] | null;

      if (currentIndices === null) {
        // Currently showing all - if unchecking, create array without this index
        if (isSelected) {
          newIndices = null;
        } else {
          newIndices = (exp.bullets || []).map((_, i) => i).filter(i => i !== bulletIndex);
        }
      } else {
        // Currently showing subset
        if (isSelected) {
          newIndices = [...currentIndices, bulletIndex].sort((a, b) => a - b);
          // If all bullets are now selected, set to null
          if (newIndices.length === (exp.bullets?.length || 0)) {
            newIndices = null;
          }
        } else {
          newIndices = currentIndices.filter(i => i !== bulletIndex);
        }
      }

      return { ...exp, selection: { ...exp.selection, selected_bullet_indices: newIndices } };
    }));
  };

  const isBulletSelected = (exp: CVWorkExperienceWithSelection, index: number): boolean => {
    if (exp.selection.selected_bullet_indices === null) return true;
    return exp.selection.selected_bullet_indices.includes(index);
  };

  if (workExperiences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {labels.title}
          </CardTitle>
          <CardDescription>{labels.noExperiences}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          {labels.title}
        </CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {workExperiences.map((exp) => {
          const isExpanded = expandedIds.has(exp.id);

          return (
            <div
              key={exp.id}
              className={`border rounded-lg transition-colors ${
                exp.selection.is_selected ? 'bg-background' : 'bg-muted/50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3 p-3">
                {/* Selection Checkbox */}
                <Checkbox
                  checked={exp.selection.is_selected}
                  onCheckedChange={(checked) => handleSelectionChange(exp.id, !!checked)}
                  className="mt-1"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{exp.title}</h4>
                    {exp.selection.is_favorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {exp.company}
                    {exp.location && ` \u2022 ${exp.location}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateRange(exp.start_date, exp.end_date, exp.current)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFavoriteToggle(exp.id)}
                    title={exp.selection.is_favorite ? labels.removeFavorite : labels.favorite}
                    className="h-8 w-8 p-0"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        exp.selection.is_favorite
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </Button>
                  <Collapsible open={isExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(exp.id)}
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
                  <div className="pt-3 border-t space-y-4">
                    {/* Description Override */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">{labels.descriptionOverride}</Label>
                        {exp.selection.description_override !== null && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDescriptionOverrideChange(exp.id, null)}
                            className="h-7 text-xs gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            {labels.resetToProfile}
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={exp.selection.description_override ?? exp.description ?? ''}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          // Set to null if it matches the original profile description
                          handleDescriptionOverrideChange(
                            exp.id,
                            newValue === (exp.description ?? '') ? null : newValue
                          );
                        }}
                        placeholder={exp.description || 'No description in profile'}
                        rows={3}
                        className={exp.selection.description_override !== null ? 'border-primary' : ''}
                      />
                      {exp.selection.description_override !== null && (
                        <p className="text-xs text-muted-foreground">
                          * {language === 'de' ? 'Angepasste Beschreibung für diesen CV' : 'Custom description for this CV'}
                        </p>
                      )}
                    </div>

                    {/* Bullet Point Selection */}
                    {exp.bullets && exp.bullets.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">{labels.selectBullets}</Label>
                        <div className="space-y-2">
                          {exp.bullets.map((bullet, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Checkbox
                                checked={isBulletSelected(exp, index)}
                                onCheckedChange={(checked) =>
                                  handleBulletSelectionChange(exp.id, index, !!checked)
                                }
                                className="mt-0.5"
                              />
                              <span className="text-sm">{bullet}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
