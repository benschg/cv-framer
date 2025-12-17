'use client';

import type { CVWorkExperienceWithSelection } from '@/types/profile-career.types';
import { Star } from 'lucide-react';
import { formatDateRange } from '@/lib/utils';
import { getDisplayModeContent } from '@/lib/cv-display-mode';

interface CVExperienceSectionProps {
  experiences: CVWorkExperienceWithSelection[];
  title?: string;
  showTitle?: boolean;
}

export function CVExperienceSection({
  experiences,
  title = 'Work Experience',
  showTitle = true
}: CVExperienceSectionProps) {
  if (!experiences || experiences.length === 0) return null;

  return (
    <section className="cv-section cv-experience">
      {showTitle && <h2>{title}</h2>}
      <div className="cv-experience-list">
        {experiences.map((exp) => {
          const displayMode = exp.selection.display_mode || 'custom';
          const { description, bullets } = getDisplayModeContent(exp, displayMode);

          return (
            <div key={exp.id} className="cv-experience-entry">
              <div className="cv-experience-header">
                <div className="flex items-center gap-1">
                  <h3>{exp.title}</h3>
                  {exp.selection.is_favorite && (
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 cv-favorite-indicator" />
                  )}
                </div>
                <span className="cv-experience-period">
                  {formatDateRange(exp.start_date, exp.end_date, exp.current)}
                </span>
              </div>
              <p className="cv-experience-company">
                {exp.company}
                {exp.location && `, ${exp.location}`}
              </p>
              {description && (
                <p className="cv-experience-description">{description}</p>
              )}
              {bullets && bullets.length > 0 && (
                <ul className="cv-experience-achievements">
                  {bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
