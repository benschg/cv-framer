import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TermsOfServiceContent } from '@/components/legal/terms-of-service-content';
import { Footer } from '@/components/shared/footer';

export const metadata = {
  title: 'Terms of Service | CV Builder',
  description: 'Terms of Service for CV Builder - Learn about the rules and guidelines for using our CV building platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
      <main className="flex-1 container mx-auto px-4 py-8">
        <TermsOfServiceContent />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
