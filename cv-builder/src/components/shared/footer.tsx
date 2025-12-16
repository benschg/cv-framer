import Link from 'next/link';
import { LEGAL_CONFIG } from '@/config/legal';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-8 mt-auto bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {LEGAL_CONFIG.companyName === '[YOUR COMPANY NAME]' ? 'CV Builder' : LEGAL_CONFIG.companyName}. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <a
              href={`mailto:${LEGAL_CONFIG.supportEmail}`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
