'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Briefcase,
  Star,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  AlignLeft,
  FileText,
  Settings2,
} from 'lucide-react';
import { formatDateRange } from '@/lib/utils';
import type { CVWorkExperienceWithSelection, WorkExperienceDisplayMode } from '@/types/profile-career.types';

interface CVWorkExperienceSectionProps {
  cvId: string;
  workExperiences: CVWorkExperienceWithSelection[];
  onChange: (experiences: CVWorkExperienceWithSelection[]) => void;
  language?: 'en' | 'de';
  showWorkExperience?: boolean;
  onShowWorkExperienceChange: (show: boolean) => void;
}

export function CVWorkExperienceSection({
  workExperiences,
  onChange,
  language = 'en',
  showWorkExperience = true,
  onShowWorkExperienceChange,
}: CVWorkExperienceSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const labels = {
    title: language === 'de' ? 'Berufserfahrung' : 'Work Experience',
    description: language === 'de'
      ? 'Wählen Sie aus, welche Erfahrungen in diesem CV angezeigt werden sollen'
      : 'Select which experiences to include in this CV',
    displayMode: language === 'de' ? 'Anzeigemodus' : 'Display Mode',
    modeSimple: language === 'de' ? 'Einfach' : 'Simple',
    modeWithDescription: language === 'de' ? 'Mit Beschreibung' : 'With Description',
    modeCustom: language === 'de' ? 'Angepasst' : 'Custom',
    modeSimpleDesc: language === 'de' ? 'Nur Grundinformationen' : 'Basic info only',
    modeWithDescriptionDesc: language === 'de' ? 'Grundinformationen + Beschreibung' : 'Basic info + description',
    modeCustomDesc: language === 'de' ? 'Vollständige Kontrolle' : 'Full control',
    descriptionOverride: language === 'de' ? 'Beschreibung anpassen' : 'Customize Description',
    selectBullets: language === 'de' ? 'Aufzählungspunkte auswählen' : 'Select Bullet Points',
    resetToProfile: language === 'de' ? 'Auf Profil zurücksetzen' : 'Reset to Profile',
    noExperiences: language === 'de'
      ? 'Keine Berufserfahrung im Profil gefunden. Fügen Sie Berufserfahrung in Ihrem Profil hinzu.'
      : 'No work experience found in your profile. Add work experience in your profile.',
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

  const handleDisplayModeChange = (id: string, mode: WorkExperienceDisplayMode) => {
    onChange(workExperiences.map(exp =>
      exp.id === id
        ? { ...exp, selection: { ...exp.selection, display_mode: mode } }
        : exp
    ));
  };

  const isBulletSelected = (exp: CVWorkExperienceWithSelection, index: number): boolean => {
    if (exp.selection.selected_bullet_indices === null) return true;
    return exp.selection.selected_bullet_indices.includes(index);
  };

  if (workExperiences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {labels.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="show-work-exp" className="text-sm text-muted-foreground">
                {labels.showInCV}
              </Label>
              <Switch
                id="show-work-exp"
                checked={showWorkExperience}
                onCheckedChange={onShowWorkExperienceChange}
              />
            </div>
          </div>
          <CardDescription>{labels.noExperiences}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={!showWorkExperience ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {labels.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="show-work-exp" className="text-sm text-muted-foreground">
              {labels.showInCV}
            </Label>
            <Switch
              id="show-work-exp"
              checked={showWorkExperience}
              onCheckedChange={onShowWorkExperienceChange}
            />
          </div>
        </div>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      {showWorkExperience && (
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
                  {/* Display Mode Toggle Buttons */}
                  <div className="flex items-center gap-0.5 border rounded-md">
                    <Button
                      variant={exp.selection.display_mode === 'simple' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => handleDisplayModeChange(exp.id, 'simple')}
                      title={labels.modeSimple}
                      className="h-7 w-7 p-0"
                    >
                      <AlignLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant={exp.selection.display_mode === 'with_description' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => handleDisplayModeChange(exp.id, 'with_description')}
                      title={labels.modeWithDescription}
                      className="h-7 w-7 p-0"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant={exp.selection.display_mode === 'custom' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => handleDisplayModeChange(exp.id, 'custom')}
                      title={labels.modeCustom}
                      className="h-7 w-7 p-0"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

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
                  <div className="pt-3 border-t ml-7 space-y-4">
                    {/* Display Mode Selector */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">{labels.displayMode}</Label>
                      <RadioGroup
                        value={exp.selection.display_mode}
                        onValueChange={(value) => handleDisplayModeChange(exp.id, value as WorkExperienceDisplayMode)}
                        className="space-y-2"
                      >
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="simple" id={`${exp.id}-simple`} className="mt-0.5" />
                          <div className="flex-1">
                            <Label htmlFor={`${exp.id}-simple`} className="font-medium cursor-pointer">
                              {labels.modeSimple}
                            </Label>
                            <p className="text-xs text-muted-foreground">{labels.modeSimpleDesc}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="with_description" id={`${exp.id}-with-desc`} className="mt-0.5" />
                          <div className="flex-1">
                            <Label htmlFor={`${exp.id}-with-desc`} className="font-medium cursor-pointer">
                              {labels.modeWithDescription}
                            </Label>
                            <p className="text-xs text-muted-foreground">{labels.modeWithDescriptionDesc}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="custom" id={`${exp.id}-custom`} className="mt-0.5" />
                          <div className="flex-1">
                            <Label htmlFor={`${exp.id}-custom`} className="font-medium cursor-pointer">
                              {labels.modeCustom}
                            </Label>
                            <p className="text-xs text-muted-foreground">{labels.modeCustomDesc}</p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Custom Mode Controls (only shown in custom mode) */}
                    {exp.selection.display_mode === 'custom' && (
                      <>
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
                            <div className="space-y-2 ml-1">
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
                      </>
                    )}
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
