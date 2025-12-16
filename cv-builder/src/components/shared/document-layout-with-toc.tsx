'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className={compact ? 'max-w-2xl' : 'max-w-6xl mx-auto'}>
      {/* Metadata Card */}
      {metadata && (
        <Card className="bg-muted/50 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
              {metadata.lastUpdated && <span>Last Updated: {metadata.lastUpdated}</span>}
              {metadata.version && <span>Version: {metadata.version}</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Layout: TOC + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Table of Contents (Desktop Sidebar) */}
        {!compact && tocItems.length > 0 && (
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <h3 className="font-semibold mb-4 text-sm">Table of Contents</h3>
              <nav className="space-y-1">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left py-1 px-2 text-sm hover:text-primary hover:bg-muted rounded-md transition-colors text-muted-foreground"
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
            <div className="lg:hidden mb-6">
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80">
                  <span className="font-semibold">Table of Contents</span>
                  <ChevronDown className="h-5 w-5" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pt-2">
                  <nav className="space-y-1">
                    {tocItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="block w-full text-left py-1 px-2 text-sm hover:text-primary hover:bg-muted rounded-md"
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
          className="fixed bottom-8 right-8 rounded-full shadow-lg z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
