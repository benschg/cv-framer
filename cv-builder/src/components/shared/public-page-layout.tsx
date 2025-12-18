import { FileText } from 'lucide-react';
import Link from 'next/link';

import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';

interface PublicPageLayoutProps {
  children: React.ReactNode;
}

export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Simple header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <FileText className="h-6 w-6" />
            <span className="text-xl font-bold">CV Builder</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto flex-1 px-4 py-8">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
