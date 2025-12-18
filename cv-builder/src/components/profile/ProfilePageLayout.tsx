'use client';

import { ReactNode } from 'react';

import { useHeaderSaveIndicator } from '@/hooks/use-header-save-indicator';

import { ProfilePageHeader, ProfilePageHeaderProps } from './ProfilePageHeader';

export interface ProfilePageLayoutProps extends ProfilePageHeaderProps {
  children?: ReactNode;
  isSaving?: boolean;
  saveSuccess?: boolean;
  headerActions?: ReactNode;
}

export function ProfilePageLayout({
  children,
  isSaving = false,
  saveSuccess = false,
  headerActions,
  ...headerProps
}: ProfilePageLayoutProps) {
  // Display save status in breadcrumb header
  useHeaderSaveIndicator(isSaving, saveSuccess);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ProfilePageHeader {...headerProps}>{headerActions}</ProfilePageHeader>
      {children}
    </div>
  );
}
