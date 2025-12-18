'use client';

import { ArrowUp,ChevronDown } from 'lucide-react';
import { ReactNode,useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TocItem {
  id: string;
  label: string;
}

interface DocumentLayoutWithTocProps {
  tocItems: TocItem[];
  children: ReactNode;
  compact?: boolean;
  metadata?: {
    lastUpdated?: string;
    version?: string;
  };
}

export function DocumentLayoutWithToc({
  tocItems,
  children,
  compact = false,
  metadata,
}: DocumentLayoutWithTocProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={compact ? 'max-w-2xl' : 'mx-auto max-w-6xl'}>
      {/* Metadata Card */}
      {metadata && (
        <Card className="mb-6 bg-muted/50">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              {metadata.lastUpdated && <span>Last Updated: {metadata.lastUpdated}</span>}
              {metadata.version && <span>Version: {metadata.version}</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Layout: TOC + Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Table of Contents (Desktop Sidebar) */}
        {!compact && tocItems.length > 0 && (
          <aside className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-4">
              <h3 className="mb-4 text-sm font-semibold">Table of Contents</h3>
              <nav className="space-y-1">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full rounded-md px-2 py-1 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Content */}
        <main className={compact ? 'col-span-1' : 'lg:col-span-3'}>
          {/* Mobile TOC (Collapsible) */}
          {!compact && tocItems.length > 0 && (
            <div className="mb-6 lg:hidden">
              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-muted p-4 hover:bg-muted/80">
                  <span className="font-semibold">Table of Contents</span>
                  <ChevronDown className="h-5 w-5" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pt-2">
                  <nav className="space-y-1">
                    {tocItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="block w-full rounded-md px-2 py-1 text-left text-sm hover:bg-muted hover:text-primary"
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Main Content */}
          {children}
        </main>
      </div>

      {/* Scroll to Top Button */}
      {!compact && showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
