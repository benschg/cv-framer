import Link from 'next/link';

import { LEGAL_CONFIG } from '@/config/legal';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {LEGAL_CONFIG.companyName}. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Terms of Service
            </Link>
            <a
              href={`mailto:${LEGAL_CONFIG.supportEmail}`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
