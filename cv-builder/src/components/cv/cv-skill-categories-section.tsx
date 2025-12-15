'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Wrench,
  Star,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { CVSkillCategoryWithSelection } from '@/types/profile-career.types';

interface CVSkillCategoriesSectionProps {
  cvId: string;
  skillCategories: CVSkillCategoryWithSelection[];
  onChange: (skillCategories: CVSkillCategoryWithSelection[]) => void;
  language?: 'en' | 'de';
  showSkills?: boolean;
  onShowSkillsChange: (show: boolean) => void;
}

export function CVSkillCategoriesSection({
  skillCategories,
  onChange,
  language = 'en',
  showSkills = true,
  onShowSkillsChange,
}: CVSkillCategoriesSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const labels = {
    title: language === 'de' ? 'Fähigkeiten' : 'Skills',
    description: language === 'de'
      ? 'Wählen Sie aus, welche Fähigkeiten in diesem CV angezeigt werden sollen'
      : 'Select which skill categories to include in this CV',
    selectSkills: language === 'de' ? 'Fähigkeiten auswählen' : 'Select Skills',
    noSkillCategories: language === 'de'
      ? 'Keine Fähigkeiten im Profil gefunden. Fügen Sie Fähigkeiten in Ihrem Profil hinzu.'
      : 'No skills found in your profile. Add skills in your profile.',
    favorite: language === 'de' ? 'Favorit' : 'Favorite',
    removeFavorite: language === 'de' ? 'Favorit entfernen' : 'Remove from favorites',
    customize: language === 'de' ? 'Anpassen' : 'Customize',
    showInCV: language === 'de' ? 'Im CV anzeigen' : 'Show in CV',
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
    onChange(skillCategories.map(cat =>
      cat.id === id
        ? { ...cat, selection: { ...cat.selection, is_selected: isSelected } }
        : cat
    ));
  };

  const handleFavoriteToggle = (id: string) => {
    onChange(skillCategories.map(cat =>
      cat.id === id
        ? { ...cat, selection: { ...cat.selection, is_favorite: !cat.selection.is_favorite } }
        : cat
    ));
  };

  const handleSkillSelectionChange = (id: string, skillIndex: number, isSelected: boolean) => {
    onChange(skillCategories.map(cat => {
      if (cat.id !== id) return cat;

      const currentIndices = cat.selection.selected_skill_indices;
      let newIndices: number[] | null;

      if (currentIndices === null) {
        // Currently showing all - if unchecking, create array without this index
        if (isSelected) {
          newIndices = null;
        } else {
          newIndices = cat.skills.map((_, i) => i).filter(i => i !== skillIndex);
        }
      } else {
        // Currently showing subset
        if (isSelected) {
          newIndices = [...currentIndices, skillIndex].sort((a, b) => a - b);
          // If all skills are now selected, set to null
          if (newIndices.length === cat.skills.length) {
            newIndices = null;
          }
        } else {
          newIndices = currentIndices.filter(i => i !== skillIndex);
        }
      }

      return { ...cat, selection: { ...cat.selection, selected_skill_indices: newIndices } };
    }));
  };

  const isSkillSelected = (cat: CVSkillCategoryWithSelection, index: number): boolean => {
    if (cat.selection.selected_skill_indices === null) return true;
    return cat.selection.selected_skill_indices.includes(index);
  };

  if (skillCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {labels.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="show-skills" className="text-sm text-muted-foreground">
                {labels.showInCV}
              </Label>
              <Switch
                id="show-skills"
                checked={showSkills}
                onCheckedChange={onShowSkillsChange}
              />
            </div>
          </div>
          <CardDescription>{labels.noSkillCategories}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={!showSkills ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {labels.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="show-skills" className="text-sm text-muted-foreground">
              {labels.showInCV}
            </Label>
            <Switch
              id="show-skills"
              checked={showSkills}
              onCheckedChange={onShowSkillsChange}
            />
          </div>
        </div>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      {showSkills && (
      <CardContent className="space-y-3">
        {skillCategories.map((cat) => {
          const isExpanded = expandedIds.has(cat.id);

          return (
            <div
              key={cat.id}
              className={`border rounded-lg transition-colors ${
                cat.selection.is_selected ? 'bg-background' : 'bg-muted/50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3 p-3">
                {/* Selection Checkbox */}
                <Checkbox
                  checked={cat.selection.is_selected}
                  onCheckedChange={(checked) => handleSelectionChange(cat.id, !!checked)}
                  className="mt-1"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{cat.category}</h4>
                    {cat.selection.is_favorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {cat.skills.length} {language === 'de' ? 'Fähigkeiten' : 'skills'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFavoriteToggle(cat.id)}
                    title={cat.selection.is_favorite ? labels.removeFavorite : labels.favorite}
                    className="h-8 w-8 p-0"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        cat.selection.is_favorite
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
                        onClick={() => toggleExpand(cat.id)}
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
                  <div className="pt-3 border-t ml-7 space-y-4">
                    {/* Skill Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm">{labels.selectSkills}</Label>
                      <div className="space-y-2 ml-1">
                        {cat.skills.map((skill, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Checkbox
                              checked={isSkillSelected(cat, index)}
                              onCheckedChange={(checked) =>
                                handleSkillSelectionChange(cat.id, index, !!checked)
                              }
                              className="mt-0.5"
                            />
                            <span className="text-sm">{skill}</span>
                          </div>
                        ))}
                      </div>
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
