'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  GripVertical,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Settings2,
} from 'lucide-react';
import type { PageLayoutOverride } from '@/types/cv.types';

// Section definitions with labels
const SIDEBAR_SECTIONS = [
  { id: 'photo', label: 'Photo', labelDe: 'Foto' },
  { id: 'contact', label: 'Contact', labelDe: 'Kontakt' },
  { id: 'skills', label: 'Skills', labelDe: 'Fähigkeiten' },
  { id: 'languages', label: 'Languages', labelDe: 'Sprachen' },
  { id: 'education', label: 'Education', labelDe: 'Bildung' },
  { id: 'certifications', label: 'Certifications', labelDe: 'Zertifikate' },
] as const;

const MAIN_SECTIONS = [
  { id: 'header', label: 'Header', labelDe: 'Kopfzeile' },
  { id: 'profile', label: 'Profile', labelDe: 'Profil' },
  { id: 'experience', label: 'Experience', labelDe: 'Erfahrung' },
  { id: 'education', label: 'Education', labelDe: 'Bildung' },
  { id: 'skills', label: 'Skills', labelDe: 'Fähigkeiten' },
  { id: 'keyCompetences', label: 'Key Competences', labelDe: 'Kernkompetenzen' },
  { id: 'projects', label: 'Projects', labelDe: 'Projekte' },
  { id: 'references', label: 'References', labelDe: 'Referenzen' },
] as const;

type SidebarSectionId = (typeof SIDEBAR_SECTIONS)[number]['id'];
type MainSectionId = (typeof MAIN_SECTIONS)[number]['id'];

interface SectionConfiguratorProps {
  pageIndex: number;
  pageLayout: PageLayoutOverride;
  isTwoColumn: boolean;
  defaultSidebar: SidebarSectionId[];
  defaultMain: MainSectionId[];
  onChange: (layout: PageLayoutOverride) => void;
  language?: 'en' | 'de';
}

export function SectionConfigurator({
  pageIndex,
  pageLayout,
  isTwoColumn,
  defaultSidebar,
  defaultMain,
  onChange,
  language = 'en',
}: SectionConfiguratorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get current sections or fall back to defaults
  const currentSidebar = (pageLayout.sidebar || defaultSidebar) as SidebarSectionId[];
  const currentMain = (pageLayout.main || defaultMain) as MainSectionId[];

  const getLabel = (section: { label: string; labelDe: string }) => {
    return language === 'de' ? section.labelDe : section.label;
  };

  const handleSidebarToggle = (sectionId: SidebarSectionId, checked: boolean) => {
    const newSidebar = checked
      ? [...currentSidebar, sectionId]
      : currentSidebar.filter((s) => s !== sectionId);
    onChange({ ...pageLayout, sidebar: newSidebar });
  };

  const handleMainToggle = (sectionId: MainSectionId, checked: boolean) => {
    const newMain = checked
      ? [...currentMain, sectionId]
      : currentMain.filter((s) => s !== sectionId);
    onChange({ ...pageLayout, main: newMain });
  };

  const moveSidebarSection = (index: number, direction: 'up' | 'down') => {
    const newSidebar = [...currentSidebar];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSidebar.length) return;
    [newSidebar[index], newSidebar[newIndex]] = [newSidebar[newIndex], newSidebar[index]];
    onChange({ ...pageLayout, sidebar: newSidebar });
  };

  const moveMainSection = (index: number, direction: 'up' | 'down') => {
    const newMain = [...currentMain];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newMain.length) return;
    [newMain[index], newMain[newIndex]] = [newMain[newIndex], newMain[index]];
    onChange({ ...pageLayout, main: newMain });
  };

  const removeSidebarSection = (sectionId: SidebarSectionId) => {
    onChange({ ...pageLayout, sidebar: currentSidebar.filter((s) => s !== sectionId) });
  };

  const removeMainSection = (sectionId: MainSectionId) => {
    onChange({ ...pageLayout, main: currentMain.filter((s) => s !== sectionId) });
  };

  // Section list with reorder controls
  const SectionList = ({
    sections,
    allSections,
    onToggle,
    onMove,
    onRemove,
    type,
  }: {
    sections: string[];
    allSections: readonly { id: string; label: string; labelDe: string }[];
    onToggle: (id: string, checked: boolean) => void;
    onMove: (index: number, direction: 'up' | 'down') => void;
    onRemove: (id: string) => void;
    type: 'sidebar' | 'main';
  }) => {
    const availableSections = allSections.filter((s) => !sections.includes(s.id));

    return (
      <div className="space-y-2">
        {/* Current sections with reorder controls */}
        {sections.length > 0 ? (
          <div className="space-y-1">
            {sections.map((sectionId, index) => {
              const section = allSections.find((s) => s.id === sectionId);
              if (!section) return null;
              return (
                <div
                  key={sectionId}
                  className="flex items-center gap-1 p-1.5 bg-muted/50 rounded text-xs"
                >
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                  <span className="flex-1">{getLabel(section)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => onMove(index, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => onMove(index, 'down')}
                    disabled={index === sections.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive"
                    onClick={() => onRemove(sectionId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            {type === 'sidebar' ? 'No sidebar sections' : 'No main sections'}
          </p>
        )}

        {/* Add section dropdown */}
        {availableSections.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add section
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1">
                {availableSections.map((section) => (
                  <Button
                    key={section.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-7 text-xs"
                    onClick={() => onToggle(section.id, true)}
                  >
                    {getLabel(section)}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className="h-8 text-xs gap-1.5">
          <Settings2 className="h-3.5 w-3.5" />
          Configure Sections
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">
              Page {pageIndex + 1} Sections
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => onChange({ ...pageLayout, sidebar: undefined, main: undefined })}
            >
              Reset to default
            </Button>
          </div>

          {isTwoColumn && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Sidebar</Label>
              <SectionList
                sections={currentSidebar}
                allSections={SIDEBAR_SECTIONS}
                onToggle={(id, checked) => handleSidebarToggle(id as SidebarSectionId, checked)}
                onMove={moveSidebarSection}
                onRemove={(id) => removeSidebarSection(id as SidebarSectionId)}
                type="sidebar"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium">Main Content</Label>
            <SectionList
              sections={currentMain}
              allSections={MAIN_SECTIONS}
              onToggle={(id, checked) => handleMainToggle(id as MainSectionId, checked)}
              onMove={moveMainSection}
              onRemove={(id) => removeMainSection(id as MainSectionId)}
              type="main"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
