import { FileText } from 'lucide-react';
import Link from 'next/link';

import { Footer } from '@/components/shared/footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Simple header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="text-xl font-bold">CV Builder</span>
          </Link>
        </div>
      </header>

      {/* Centered content */}
      <main className="flex flex-1 items-center justify-center p-4">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
