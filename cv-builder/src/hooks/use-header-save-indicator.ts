import { useEffect } from 'react';

/**
 * Hook to display save status in the breadcrumb header
 * Use this hook in any page that needs to show save status in the header
 */
export function useHeaderSaveIndicator(isSaving: boolean, saveSuccess: boolean) {
  useEffect(() => {
    const headerRight = document.getElementById('breadcrumb-header-right');
    if (!headerRight) return;

    if (isSaving) {
      headerRight.innerHTML = `
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <span>Saving...</span>
        </div>
      `;
    } else if (saveSuccess) {
      headerRight.innerHTML = `
        <div class="flex items-center gap-2 text-sm text-green-600">
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <span>Saved</span>
        </div>
      `;
    } else {
      headerRight.innerHTML = '';
    }

    // Cleanup on unmount
    return () => {
      if (headerRight) {
        headerRight.innerHTML = '';
      }
    };
  }, [isSaving, saveSuccess]);
}
