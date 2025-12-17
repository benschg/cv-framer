/**
 * Default CV Layout Configurations
 *
 * Provides pre-configured layouts for single-column and two-column CV designs.
 * These can be customized per-CV via display settings.
 */

import type { CVLayoutConfig } from '@/types/cv-layout.types';

/**
 * Single-column layout (traditional CV style)
 * All content flows in a single column, no sidebar.
 */
export const defaultSingleColumnLayout: CVLayoutConfig = {
  mode: 'single-column',
  pages: [
    {
      sidebar: [],
      main: ['header', 'profile', 'experience'],
    },
    {
      sidebar: [],
      main: ['education', 'skills', 'keyCompetences'],
    },
  ],
};

/**
 * Two-column layout (modern CV style)
 * Photo, contact, and compact info in sidebar; detailed content in main area.
 */
export const defaultTwoColumnLayout: CVLayoutConfig = {
  mode: 'two-column',
  pages: [
    {
      sidebar: ['photo', 'contact', 'skills', 'languages'],
      main: ['header', 'profile', 'keyCompetences'],
    },
    {
      sidebar: ['education', 'certifications'],
      main: ['experience'],
    },
  ],
};

/**
 * Get the default layout configuration for a given mode
 */
export function getDefaultLayout(mode: 'single-column' | 'two-column'): CVLayoutConfig {
  return mode === 'two-column' ? defaultTwoColumnLayout : defaultSingleColumnLayout;
}

/**
 * Create a minimal single-page layout
 * Useful for compact CVs or when content fits on one page
 */
export function createSinglePageLayout(mode: 'single-column' | 'two-column'): CVLayoutConfig {
  if (mode === 'two-column') {
    return {
      mode: 'two-column',
      pages: [
        {
          sidebar: ['photo', 'contact', 'skills', 'languages', 'education'],
          main: ['header', 'profile', 'experience', 'keyCompetences'],
        },
      ],
    };
  }

  return {
    mode: 'single-column',
    pages: [
      {
        sidebar: [],
        main: ['header', 'profile', 'experience', 'education', 'skills', 'keyCompetences'],
      },
    ],
  };
}
