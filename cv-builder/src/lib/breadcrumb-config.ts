export interface BreadcrumbSegment {
  label: string;
  href: string;
  isClickable: boolean;
}

export interface RouteConfig {
  label: string;
  parent?: string;
  getDynamicLabel?: (id: string, data?: unknown) => string | Promise<string>;
}

/**
 * Configuration for breadcrumb routes
 * Maps route paths to their display labels and parent routes
 */
export const routeConfig: Record<string, RouteConfig> = {
  // Level 1 - Root pages
  '/cv': {
    label: 'My CVs',
  },
  '/profile': {
    label: 'Profile',
  },
  '/profile/experience': {
    label: 'Work Experience',
    parent: '/profile',
  },
  '/profile/education': {
    label: 'Education',
    parent: '/profile',
  },
  '/profile/skills': {
    label: 'Skills',
    parent: '/profile',
  },
  '/profile/certifications': {
    label: 'Certifications',
    parent: '/profile',
  },
  '/profile/references': {
    label: 'References',
    parent: '/profile',
  },
  '/settings': {
    label: 'Settings',
  },
  '/cover-letter': {
    label: 'Cover Letters',
  },
  '/applications': {
    label: 'Applications',
  },

  // Level 2 - CV routes
  '/cv/new': {
    label: 'New CV',
    parent: '/cv',
  },
  '/cv/[id]': {
    label: 'CV',
    parent: '/cv',
    getDynamicLabel: async (id: string, data?: unknown) => {
      if (data && typeof data === 'object' && 'name' in data) {
        return (data as { name: string }).name;
      }
      return 'CV';
    },
  },

  // Level 2 - Cover Letter routes
  '/cover-letter/new': {
    label: 'New Cover Letter',
    parent: '/cover-letter',
  },
  '/cover-letter/[id]': {
    label: 'Cover Letter',
    parent: '/cover-letter',
    getDynamicLabel: async (id: string, data?: unknown) => {
      if (data && typeof data === 'object' && 'title' in data) {
        return (data as { title: string }).title;
      }
      return 'Cover Letter';
    },
  },

  // Level 2 - Application routes
  '/applications/new': {
    label: 'New Application',
    parent: '/applications',
  },
  '/applications/[id]': {
    label: 'Application',
    parent: '/applications',
    getDynamicLabel: async (id: string, data?: unknown) => {
      if (data && typeof data === 'object' && 'company' in data && 'position' in data) {
        const { company, position } = data as { company: string; position: string };
        return `${position} at ${company}`;
      }
      return 'Application';
    },
  },
};

/**
 * Get the breadcrumb configuration for a given pathname
 */
export function getRouteConfig(pathname: string): RouteConfig | null {
  // Try exact match first
  if (routeConfig[pathname]) {
    return routeConfig[pathname];
  }

  // Try to match dynamic routes
  const segments = pathname.split('/').filter(Boolean);

  // Match patterns like /cv/[id]
  for (const [pattern, config] of Object.entries(routeConfig)) {
    const patternSegments = pattern.split('/').filter(Boolean);

    if (patternSegments.length === segments.length) {
      const matches = patternSegments.every((seg, i) => {
        return seg.startsWith('[') || seg === segments[i];
      });

      if (matches) {
        return config;
      }
    }
  }

  return null;
}

/**
 * Build the full breadcrumb path for a given pathname
 */
export function buildBreadcrumbPath(pathname: string): string[] {
  const path: string[] = [];
  const config = getRouteConfig(pathname);

  if (!config) {
    return [];
  }

  // Build path by following parent chain
  let currentPath = pathname;
  let currentConfig = config;

  while (currentConfig) {
    path.unshift(currentPath);

    if (currentConfig.parent) {
      currentPath = currentConfig.parent;
      currentConfig = routeConfig[currentPath];
    } else {
      break;
    }
  }

  return path;
}

/**
 * Extract dynamic ID from pathname
 */
export function extractDynamicId(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);

  // For routes like /cv/[id], the last segment is the ID
  // Check if this matches a dynamic route pattern
  const config = getRouteConfig(pathname);
  if (config && config.getDynamicLabel) {
    return segments[segments.length - 1];
  }

  return null;
}
