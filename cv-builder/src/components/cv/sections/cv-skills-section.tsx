'use client';

import type { CVSkillCategoryWithSelection } from '@/types/profile-career.types';
import { Star } from 'lucide-react';
import { filterSelectedSkills } from '@/lib/cv-skill-filter';

interface CVSkillsSectionProps {
  skillCategories: CVSkillCategoryWithSelection[];
  title?: string;
  /** Display as chips (default) or inline text */
  displayMode?: 'chips' | 'inline';
}

export function CVSkillsSection({
  skillCategories,
  title = 'Skills',
  displayMode = 'chips'
}: CVSkillsSectionProps) {
  if (!skillCategories || skillCategories.length === 0) return null;

  return (
    <section className="cv-section cv-skills">
      <h2>{title}</h2>
      <div className="cv-skills-categories">
        {skillCategories.map((cat) => {
          const skills = filterSelectedSkills(cat.skills, cat.selection.selected_skill_indices);

          return (
            <div key={cat.id} className="cv-skills-category">
              <div className="flex items-center gap-1">
                <span className="cv-skills-category-name">{cat.category}:</span>
                {cat.selection.is_favorite && (
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              {displayMode === 'chips' ? (
                <div className="cv-skills-list">
                  {skills.map((skill, i) => (
                    <span key={i} className="cv-skill-chip">{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="cv-skills-inline">{skills.join(', ')}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Compact skills display for sidebar */
interface CVSkillsSidebarProps {
  skillCategories: CVSkillCategoryWithSelection[];
  title?: string;
}

export function CVSkillsSidebar({ skillCategories, title = 'Skills' }: CVSkillsSidebarProps) {
  if (!skillCategories || skillCategories.length === 0) return null;

  // Flatten all skills into a single list for sidebar display
  const allSkills = skillCategories.flatMap((cat) =>
    filterSelectedSkills(cat.skills, cat.selection.selected_skill_indices)
  );

  return (
    <div className="cv-sidebar-section">
      <h3 className="cv-sidebar-title">{title}</h3>
      <div className="cv-sidebar-skills">
        {allSkills.map((skill, i) => (
          <span key={i} className="cv-sidebar-skill">{skill}</span>
        ))}
      </div>
    </div>
  );
}
