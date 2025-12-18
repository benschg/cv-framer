'use client';

import { PanelLeft, PanelRight, Square } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { PageLayoutOverride } from '@/types/cv.types';
import type { CVMainSection, CVSidebarSection } from '@/types/cv-layout.types';

import { SectionConfigurator } from './section-configurator';

// Default sections for each page in two-column mode
const DEFAULT_SIDEBAR_SECTIONS: Record<number, readonly CVSidebarSection[]> = {
  0: ['photo', 'contact', 'skills', 'languages'] as const,
  1: ['education', 'certifications'] as const,
};

const DEFAULT_MAIN_SECTIONS: Record<number, readonly CVMainSection[]> = {
  0: ['header', 'profile', 'experience'] as const,
  1: ['keyCompetences'] as const,
};

interface PageLayoutConfiguratorProps {
  /** Current page layout overrides */
  pageLayouts: PageLayoutOverride[];
  /** Number of pages in the CV */
  pageCount: number;
  /** Whether the layout mode supports sidebars */
  isTwoColumn: boolean;
  /** Callback when page layouts change */
  onChange: (pageLayouts: PageLayoutOverride[]) => void;
  /** Language for labels */
  language?: 'en' | 'de';
}

export function PageLayoutConfigurator({
  pageLayouts,
  pageCount,
  isTwoColumn,
  onChange,
  language = 'en',
}: PageLayoutConfiguratorProps) {
  if (!isTwoColumn) {
    return (
      <p className="text-xs text-muted-foreground">
        Sidebar position is only available in two-column layout mode.
      </p>
    );
  }

  const handlePositionChange = (pageIndex: number, position: string) => {
    const newLayouts = [...pageLayouts];
    // Ensure array is long enough
    while (newLayouts.length <= pageIndex) {
      newLayouts.push({});
    }
    newLayouts[pageIndex] = {
      ...newLayouts[pageIndex],
      sidebarPosition: position as 'left' | 'right' | 'none',
    };
    onChange(newLayouts);
  };

  const handlePageLayoutChange = (pageIndex: number, layout: PageLayoutOverride) => {
    const newLayouts = [...pageLayouts];
    // Ensure array is long enough
    while (newLayouts.length <= pageIndex) {
      newLayouts.push({});
    }
    newLayouts[pageIndex] = layout;
    onChange(newLayouts);
  };

  const getPosition = (pageIndex: number): string => {
    return pageLayouts[pageIndex]?.sidebarPosition || 'left';
  };

  const getPageLayout = (pageIndex: number): PageLayoutOverride => {
    return pageLayouts[pageIndex] || {};
  };

  const getDefaultSidebar = (pageIndex: number): readonly CVSidebarSection[] => {
    return DEFAULT_SIDEBAR_SECTIONS[pageIndex] || [];
  };

  const getDefaultMain = (pageIndex: number): readonly CVMainSection[] => {
    return DEFAULT_MAIN_SECTIONS[pageIndex] || [];
  };

  // Generate page entries (minimum 2 pages for configuration)
  const pages = Array.from({ length: Math.max(pageCount, 2) }, (_, i) => i);

  return (
    <div className="space-y-3">
      <Label className="text-xs">Page Layout Configuration</Label>
      <div className="space-y-3">
        {pages.map((pageIndex) => (
          <div key={pageIndex} className="flex flex-wrap items-center gap-3">
            <span className="w-16 text-sm text-muted-foreground">Page {pageIndex + 1}</span>
            <ToggleGroup
              type="single"
              value={getPosition(pageIndex)}
              onValueChange={(value) => {
                if (value) handlePositionChange(pageIndex, value);
              }}
              className="justify-start"
            >
              <ToggleGroupItem
                value="left"
                aria-label="Sidebar left"
                className="gap-1.5 px-2.5"
                title="Sidebar on left"
              >
                <PanelLeft className="h-4 w-4" />
                <span className="text-xs">Left</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="right"
                aria-label="Sidebar right"
                className="gap-1.5 px-2.5"
                title="Sidebar on right"
              >
                <PanelRight className="h-4 w-4" />
                <span className="text-xs">Right</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="none"
                aria-label="No sidebar"
                className="gap-1.5 px-2.5"
                title="Full width (no sidebar)"
              >
                <Square className="h-4 w-4" />
                <span className="text-xs">None</span>
              </ToggleGroupItem>
            </ToggleGroup>
            <SectionConfigurator
              pageIndex={pageIndex}
              pageLayout={getPageLayout(pageIndex)}
              isTwoColumn={isTwoColumn}
              defaultSidebar={getDefaultSidebar(pageIndex)}
              defaultMain={getDefaultMain(pageIndex)}
              onChange={(layout) => handlePageLayoutChange(pageIndex, layout)}
              language={language}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Choose where to place the sidebar on each page, and configure which sections appear.
      </p>
    </div>
  );
}
