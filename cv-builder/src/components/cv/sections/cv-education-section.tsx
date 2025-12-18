'use client';

import type { CVEducationWithSelection } from '@/types/profile-career.types';
import { Star } from 'lucide-react';
import { formatDateRange } from '@/lib/utils';

interface CVEducationSectionProps {
  educations: CVEducationWithSelection[];
  title?: string;
  showTitle?: boolean;
}

export function CVEducationSection({
  educations,
  title = 'Education',
  showTitle = true
}: CVEducationSectionProps) {
  if (!educations || educations.length === 0) return null;

  return (
    <section className="cv-section cv-education">
      {showTitle && <h2>{title}</h2>}
      <div className="cv-education-list">
        {educations.map((edu) => {
          const description = edu.selection.description_override ?? edu.description;

          return (
            <div key={edu.id} className="cv-education-entry">
              <div className="cv-education-header">
                <div className="flex items-center gap-1">
                  <h3>{edu.degree}</h3>
                  {edu.selection.is_favorite && (
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 cv-favorite-indicator" />
                  )}
                </div>
                <span className="cv-education-period">
                  {formatDateRange(edu.start_date, edu.end_date)}
                </span>
              </div>
              <p className="cv-education-institution">
                {edu.institution}
                {edu.field && ` \u2022 ${edu.field}`}
              </p>
              {edu.grade && (
                <p className="cv-education-grade">{edu.grade}</p>
              )}
              {description && (
                <p className="cv-experience-description">{description}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
