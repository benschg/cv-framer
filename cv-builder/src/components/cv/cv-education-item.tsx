'use client';

import { Star } from 'lucide-react';

import { formatDateRange } from '@/lib/utils';
import type { CVEducationWithSelection } from '@/types/profile-career.types';

interface CVEducationItemProps {
  education: CVEducationWithSelection;
  description: string | null;
}

export function CVEducationItem({ education: edu, description }: CVEducationItemProps) {
  return (
    <div className="text-sm">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-1">
          <span className="font-semibold">{edu.degree}</span>
          {edu.selection.is_favorite && (
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        <span className="text-xs text-gray-500">
          {formatDateRange(edu.start_date, edu.end_date)}
        </span>
      </div>
      <p className="text-gray-600">
        {edu.institution}
        {edu.field && ` • ${edu.field}`}
      </p>
      {edu.grade && <p className="text-xs text-gray-500">{edu.grade}</p>}
      {description && <p className="mt-1 text-gray-700">{description}</p>}
    </div>
  );
}
