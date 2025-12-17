/**
 * CV Layout Configuration Types
 *
 * Defines the structure for configurable CV layouts, supporting both
 * single-column and two-column (sidebar + main) page designs.
 */

/** Sections that can appear in the sidebar (two-column layout) */
export type CVSidebarSection =
  | 'photo'
  | 'contact'
  | 'skills'
  | 'languages'
  | 'education'
  | 'certifications';

/** Sections that can appear in the main content area */
export type CVMainSection =
  | 'header'
  | 'profile'
  | 'experience'
  | 'education'
  | 'skills'
  | 'keyCompetences'
  | 'projects'
  | 'references';

/** Layout for a single CV page */
export interface CVPageLayout {
  /** Sidebar sections - if empty, page uses full-width layout */
  sidebar: CVSidebarSection[];
  /** Main content sections */
  main: CVMainSection[];
}

/** Complete layout configuration for a CV */
export interface CVLayoutConfig {
  /** Layout mode: single-column (no sidebar) or two-column (with sidebar) */
  mode: 'single-column' | 'two-column';
  /** Page layouts - each element defines one page */
  pages: CVPageLayout[];
}

/** Layout mode type (exported for use in DisplaySettings) */
export type CVLayoutMode = 'single-column' | 'two-column';
