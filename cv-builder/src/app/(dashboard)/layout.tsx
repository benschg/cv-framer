'use client';

import { usePathname } from 'next/navigation';

import { ProfileModalProvider } from '@/components/profile/modal';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide the dashboard header on CV editor pages since they have their own custom header
  const isCVEditor = pathname?.match(/^\/cv\/[^/]+$/) && pathname !== '/cv/new';

  // Remove padding for guide pages to prevent CV preview cutoff
  const isGuidePage = pathname?.startsWith('/guide');

  return (
    <ProfileModalProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex h-screen flex-col overflow-y-hidden overflow-x-visible">
          {!isCVEditor && (
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb />
              <div className="ml-auto" id="breadcrumb-header-right"></div>
            </header>
          )}
          <main
            className={
              isCVEditor
                ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
                : isGuidePage
                  ? 'min-h-0 flex-1 overflow-y-auto'
                  : 'min-h-0 flex-1 overflow-y-auto p-4'
            }
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProfileModalProvider>
  );
}
