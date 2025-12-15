'use client';

import { ReactNode } from 'react';
import { ProfilePageHeader, ProfilePageHeaderProps } from './ProfilePageHeader';
import { useHeaderSaveIndicator } from '@/hooks/use-header-save-indicator';

export interface ProfilePageLayoutProps extends ProfilePageHeaderProps {
  children: ReactNode;
  isSaving?: boolean;
  saveSuccess?: boolean;
}

export function ProfilePageLayout({
  children,
  isSaving = false,
  saveSuccess = false,
  ...headerProps
}: ProfilePageLayoutProps) {
  // Display save status in breadcrumb header
  useHeaderSaveIndicator(isSaving, saveSuccess);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProfilePageHeader {...headerProps} />
      {children}
    </div>
  );
}
