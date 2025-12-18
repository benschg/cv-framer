'use client';

import { Settings2 } from 'lucide-react';
import { useState } from 'react';

import { SectionList } from '@/components/cv/section-list';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  defaultSidebar: readonly SidebarSectionId[];
  defaultMain: readonly MainSectionId[];
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
  const currentSidebar = (pageLayout.sidebar || [...defaultSidebar]) as SidebarSectionId[];
  const currentMain = (pageLayout.main || [...defaultMain]) as MainSectionId[];

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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className="h-8 gap-1.5 text-xs">
          <Settings2 className="h-3.5 w-3.5" />
          Configure Sections
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Page {pageIndex + 1} Sections</h4>
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
                language={language}
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
              language={language}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
