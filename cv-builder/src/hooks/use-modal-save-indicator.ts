import { useEffect } from 'react';

/**
 * Hook to display save status in a modal header container
 * Similar to useHeaderSaveIndicator but targets modal-specific containers
 *
 * @param isSaving - Whether a save operation is in progress
 * @param saveSuccess - Whether the last save was successful
 * @param containerId - ID of the DOM element to render the indicator into
 */
export function useModalSaveIndicator(
  isSaving: boolean,
  saveSuccess: boolean,
  containerId: string
) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (isSaving) {
      container.innerHTML = `
        <span class="flex items-center gap-1.5 text-sm text-muted-foreground">
          <svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Saving...</span>
        </span>
      `;
    } else if (saveSuccess) {
      container.innerHTML = `
        <span class="flex items-center gap-1.5 text-sm text-green-600">
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span>Saved</span>
        </span>
      `;
    } else {
      container.innerHTML = '';
    }

    // Cleanup function
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isSaving, saveSuccess, containerId]);
}
