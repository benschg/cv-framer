'use client';

import { Star } from 'lucide-react';

import { formatDateRange } from '@/lib/utils';
import type { CVWorkExperienceWithSelection } from '@/types/profile-career.types';

interface CVWorkExperienceItemProps {
  experience: CVWorkExperienceWithSelection;
  description: string | null;
  bullets: string[] | null;
}

export function CVWorkExperienceItem({
  experience: exp,
  description,
  bullets,
}: CVWorkExperienceItemProps) {
  return (
    <div className="text-sm">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-1">
          <span className="font-semibold">{exp.title}</span>
          {exp.selection.is_favorite && (
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        <span className="text-xs text-gray-500">
          {formatDateRange(exp.start_date, exp.end_date, exp.current)}
        </span>
      </div>
      <p className="text-gray-600">
        {exp.company}
        {exp.location && `, ${exp.location}`}
      </p>
      {description && <p className="mt-1 text-gray-700">{description}</p>}
      {bullets && bullets.length > 0 && (
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-gray-700">
          {bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
