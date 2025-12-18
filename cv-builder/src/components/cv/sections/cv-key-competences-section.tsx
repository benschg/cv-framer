'use client';

import { Star } from 'lucide-react';

import type { CVKeyCompetenceWithSelection } from '@/types/profile-career.types';

interface CVKeyCompetencesSectionProps {
  competences: CVKeyCompetenceWithSelection[];
  title?: string;
}

export function CVKeyCompetencesSection({
  competences,
  title = 'Key Competences',
}: CVKeyCompetencesSectionProps) {
  if (!competences || competences.length === 0) return null;

  return (
    <section className="cv-section cv-key-competences">
      <h2>{title}</h2>
      <div className="cv-competences-list">
        {competences.map((comp) => {
          const description = comp.selection.description_override ?? comp.description;

          return (
            <div key={comp.id} className="cv-competence-item">
              <div className="flex items-center gap-1">
                <span className="cv-competence-title">{comp.title}</span>
                {comp.selection.is_favorite && (
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                )}
              </div>
              {description && <p className="cv-competence-description">{description}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
