'use client';

import { ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  type BreadcrumbSegment,
  buildBreadcrumbPath,
  extractDynamicId,
  getRouteConfig,
} from '@/lib/breadcrumb-config';
import { fetchCV } from '@/services/cv.service';

interface BreadcrumbProps {
  /**
   * Override the current pathname (useful for custom headers)
   */
  pathname?: string;
  /**
   * Override the label for the current page
   */
  currentLabel?: string;
  /**
   * Pass pre-fetched data to avoid redundant fetches
   */
  data?: unknown;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function Breadcrumb({
  pathname: overridePath,
  currentLabel,
  data: prefetchedData,
  className = '',
}: BreadcrumbProps) {
  const currentPathname = usePathname();
  const router = useRouter();
  const pathname = overridePath || currentPathname;

  const [segments, setSegments] = useState<BreadcrumbSegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buildSegments = async () => {
      setLoading(true);
      const breadcrumbPath = buildBreadcrumbPath(pathname);

      if (breadcrumbPath.length === 0) {
        setSegments([]);
        setLoading(false);
        return;
      }

      const builtSegments: BreadcrumbSegment[] = [];

      for (let i = 0; i < breadcrumbPath.length; i++) {
        const path = breadcrumbPath[i];
        const config = getRouteConfig(path);
        const isLast = i === breadcrumbPath.length - 1;

        if (!config) continue;

        let label = config.label;

        // For the last segment, use override if provided
        if (isLast && currentLabel) {
          label = currentLabel;
        }
        // Handle dynamic labels
        else if (config.getDynamicLabel) {
          const dynamicId = extractDynamicId(path);
          if (dynamicId) {
            try {
              // Use prefetched data if available and this is the current path
              if (isLast && prefetchedData) {
                label = await config.getDynamicLabel(dynamicId, prefetchedData);
              } else {
                // Fetch data for this specific path
                const fetchedData = await fetchDataForPath(path, dynamicId);
                label = await config.getDynamicLabel(dynamicId, fetchedData);
              }
            } catch (error) {
              // Fall back to default label on error
              console.error('Error fetching dynamic label:', error);
            }
          }
        }

        builtSegments.push({
          label,
          href: path,
          isClickable: !isLast,
        });
      }

      setSegments(builtSegments);
      setLoading(false);
    };

    buildSegments();
  }, [pathname, currentLabel, prefetchedData]);

  const handleClick = (href: string) => {
    router.push(href);
  };

  // Don't render anything while loading on initial mount
  if (loading && segments.length === 0) {
    return (
      <div className={`hidden items-center gap-2 sm:flex ${className}`}>
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  // Don't render if there are no segments
  if (segments.length === 0) {
    return null;
  }

  // For root pages (single segment), render without chevron
  if (segments.length === 1) {
    return (
      <div className={`hidden items-center text-sm text-foreground sm:flex ${className}`}>
        {segments[0].label}
      </div>
    );
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`hidden items-center gap-2 text-sm sm:flex ${className}`}
    >
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        return (
          <div key={segment.href} className="flex items-center gap-2">
            {segment.isClickable ? (
              <button
                onClick={() => handleClick(segment.href)}
                className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
                type="button"
              >
                {segment.label}
              </button>
            ) : (
              <span className="text-foreground">
                {loading && isLast ? <Skeleton className="inline-block h-4 w-32" /> : segment.label}
              </span>
            )}

            {!isLast && (
              <ChevronRight
                className="h-4 w-4 flex-shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Fetch data for a specific path to resolve dynamic labels
 */
async function fetchDataForPath(path: string, id: string): Promise<unknown> {
  // Determine what type of data to fetch based on the path
  if (path.startsWith('/cv/') && !path.includes('new')) {
    const result = await fetchCV(id);
    return result.data;
  }

  // Cover letters
  if (path.startsWith('/cover-letter/') && !path.includes('new')) {
    // TODO: Implement cover letter fetching when service is available
    return null;
  }

  // Applications
  if (path.startsWith('/applications/') && !path.includes('new')) {
    // TODO: Implement application fetching when service is available
    return null;
  }

  return null;
}
