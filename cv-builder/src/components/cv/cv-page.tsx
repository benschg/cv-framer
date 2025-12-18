'use client';

import { forwardRef, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Mail, Phone, Linkedin, Globe } from 'lucide-react';

interface CVPageProps {
  children: ReactNode;
  pageNumber: number;
  totalPages: number;
  format?: 'A4' | 'Letter';
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  zoom?: number; // 0 = auto (CSS media queries), > 0 = manual zoom level
}

export const CVPage = forwardRef<HTMLDivElement, CVPageProps>(
  ({ children, pageNumber, totalPages, format = 'A4', email, phone, linkedin, website, zoom = 0 }, ref) => {
    const hasContact = email || phone || linkedin || website;
    const contentRef = useRef<HTMLDivElement>(null);

    // Check if content overflows in sidebar, main content, and specific sections
    const checkOverflow = useCallback(() => {
      if (!contentRef.current) return;

      const pageContent = contentRef.current;

      // Check sidebar overflow
      const sidebar = pageContent.querySelector('.cv-sidebar');
      if (sidebar) {
        const hasOverflow = sidebar.scrollHeight > sidebar.clientHeight;
        sidebar.classList.toggle('cv-overflow', hasOverflow);
      }

      // Check main content overflow
      const mainContent = pageContent.querySelector('.cv-main-content');
      if (mainContent) {
        const mainContentEl = mainContent as HTMLElement;
        const mainContentOverflows = mainContentEl.scrollHeight > mainContentEl.clientHeight + 2;
        mainContent.classList.toggle('cv-overflow', mainContentOverflows);

        // Check each section - mark as overflowing if main content is clipped
        const sections = mainContent.querySelectorAll('.cv-section');
        sections.forEach((section, index) => {
          const isLastSection = index === sections.length - 1;
          const sectionOverflows = mainContentOverflows && isLastSection;
          section.classList.toggle('cv-overflow', sectionOverflows);
        });
      }
    }, []);

    // Check overflow on mount and when children change
    useEffect(() => {
      checkOverflow();
      const timeout1 = setTimeout(checkOverflow, 100);
      const timeout2 = setTimeout(checkOverflow, 500);
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }, [children, checkOverflow]);

    // Check overflow on window resize
    useEffect(() => {
      window.addEventListener('resize', checkOverflow);
      return () => window.removeEventListener('resize', checkOverflow);
    }, [checkOverflow]);

    // Calculate CSS custom properties for manual zoom
    const getZoomStyles = (): React.CSSProperties => {
      if (zoom === 0) return {}; // Auto mode - let CSS handle it

      const scaleFactor = 1 - zoom;
      return {
        '--manual-zoom-transform': `scale(${zoom})`,
        '--manual-zoom-margin-bottom': `calc(-297mm * ${scaleFactor})`,
        '--manual-zoom-margin-left': `calc(-210mm * ${scaleFactor / 2})`,
        '--manual-zoom-margin-right': `calc(-210mm * ${scaleFactor / 2})`,
        transformOrigin: 'top center',
      } as React.CSSProperties;
    };

    return (
      <div
        className={`cv-page ${zoom > 0 ? 'cv-page-manual-zoom' : ''}`}
        ref={ref}
        data-format={format}
        style={getZoomStyles()}
      >
        <div className="cv-page-content" ref={contentRef}>
          {children}
        </div>
        <div className="cv-page-footer">
          <div className="cv-footer-contact">
            {email && (
              <span className="cv-footer-item">
                <Mail className="h-3 w-3" />
                {email}
              </span>
            )}
            {email && phone && <span className="cv-footer-separator">|</span>}
            {phone && (
              <span className="cv-footer-item">
                <Phone className="h-3 w-3" />
                {phone}
              </span>
            )}
            {hasContact && linkedin && (email || phone) && (
              <span className="cv-footer-separator">|</span>
            )}
            {linkedin && (
              <span className="cv-footer-item">
                <Linkedin className="h-3 w-3" />
                {linkedin}
              </span>
            )}
            {linkedin && website && <span className="cv-footer-separator">|</span>}
            {website && (
              <span className="cv-footer-item">
                <Globe className="h-3 w-3" />
                {website}
              </span>
            )}
          </div>
          <span className="cv-page-number">
            {pageNumber} / {totalPages}
          </span>
        </div>
      </div>
    );
  }
);

CVPage.displayName = 'CVPage';
