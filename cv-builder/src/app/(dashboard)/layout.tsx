'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb } from '@/components/shared/breadcrumb';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide the dashboard header on CV editor pages since they have their own custom header
  const isCVEditor = pathname?.match(/^\/cv\/[^/]+$/) && pathname !== '/cv/new';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {!isCVEditor && (
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb />
          </header>
        )}
        <main className={isCVEditor ? "flex-1 overflow-hidden flex flex-col min-h-0" : "flex-1 overflow-y-auto p-4 min-h-0"}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
