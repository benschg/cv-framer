import type {
  CVWorkExperienceWithSelection,
  WorkExperienceDisplayMode,
} from '@/types/profile-career.types';

interface DisplayModeContent {
  description: string | null;
  bullets: string[] | null;
}

/**
 * Determines what content to display based on the work experience display mode
 */
export function getDisplayModeContent(
  exp: CVWorkExperienceWithSelection,
  displayMode: WorkExperienceDisplayMode
): DisplayModeContent {
  switch (displayMode) {
    case 'simple':
      // Simple mode: no description, no bullets
      return { description: null, bullets: null };

    case 'with_description':
      // With description mode: show description (or override), but no bullets
      return {
        description: exp.selection.description_override ?? exp.description,
        bullets: null,
      };

    case 'custom':
      // Custom mode: respect override and bullet selection
      return {
        description: exp.selection.description_override ?? exp.description,
        bullets:
          exp.selection.selected_bullet_indices === null
            ? exp.bullets
            : exp.bullets?.filter((_, i) => exp.selection.selected_bullet_indices!.includes(i)) ||
              null,
      };

    default:
      return { description: null, bullets: null };
  }
}
