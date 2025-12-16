'use client';

import type { CVContent, UserProfile, DisplaySettings } from '@/types/cv.types';
import type { CVWorkExperienceWithSelection, CVEducationWithSelection, CVSkillCategoryWithSelection, CVKeyCompetenceWithSelection } from '@/types/profile-career.types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { ReactNode } from 'react';
import { formatDateRange } from '@/lib/utils';

interface CVPreviewProps {
  content: CVContent;
  userProfile?: UserProfile;
  settings?: Partial<DisplaySettings> | null;
  language?: 'en' | 'de';
  photoUrl?: string | null;
  userInitials?: string;
  /** Optional: Custom render for the photo (e.g., wrapped in a Popover) */
  photoElement?: ReactNode;
  /** Work experiences with per-CV selections */
  workExperiences?: CVWorkExperienceWithSelection[];
  /** Educations with per-CV selections */
  educations?: CVEducationWithSelection[];
  /** Skill categories with per-CV selections */
  skillCategories?: CVSkillCategoryWithSelection[];
  /** Key competences with per-CV selections */
  keyCompetences?: CVKeyCompetenceWithSelection[];
}

export function CVPreview({ content, userProfile, settings, language = 'en', photoUrl, userInitials = 'U', photoElement, workExperiences, educations, skillCategories, keyCompetences }: CVPreviewProps) {
  const accentColor = settings?.accentColor || '#2563eb';
  const textColor = settings?.textColor || '#111827';
  const fontFamily = settings?.fontFamily || 'sans-serif';
  const showPhoto = settings?.showPhoto !== false && photoUrl;
  const format = settings?.format || 'A4';

  // Page dimensions in mm
  const pageDimensions = {
    A4: { width: 210, height: 297 },
    Letter: { width: 216, height: 279 }
  };

  const { width: pageWidth, height: pageHeight } = pageDimensions[format];

  const name = userProfile
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
    : language === 'de' ? 'Ihr Name' : 'Your Name';

  const labels = {
    profile: language === 'de' ? 'Profil' : 'Profile',
    workExperience: language === 'de' ? 'Berufserfahrung' : 'Work Experience',
    education: language === 'de' ? 'Ausbildung' : 'Education',
    skills: language === 'de' ? 'Fähigkeiten' : 'Skills',
    keyCompetences: language === 'de' ? 'Kernkompetenzen' : 'Key Competences',
  };

  // Only show sections if the settings are enabled
  const showWorkExperience = settings?.showWorkExperience !== false;
  const showEducation = settings?.showEducation !== false;
  const showSkills = settings?.showSkills !== false;
  const showKeyCompetences = settings?.showKeyCompetences !== false;

  // Filter to only selected items
  const selectedWorkExperiences = showWorkExperience
    ? (workExperiences?.filter(exp => exp.selection.is_selected) || [])
    : [];
  const selectedEducations = showEducation
    ? (educations?.filter(edu => edu.selection.is_selected) || [])
    : [];
  const selectedSkillCategories = showSkills
    ? (skillCategories?.filter(cat => cat.selection.is_selected) || [])
    : [];
  const selectedKeyCompetences = showKeyCompetences
    ? (keyCompetences?.filter(comp => comp.selection.is_selected) || [])
    : [];

  return (
    <div
      className="space-y-4"
      style={{
        fontFamily: fontFamily,
        color: textColor
      }}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-sm border mx-auto text-[10pt] leading-relaxed relative"
        style={{
          width: `${pageWidth}mm`,
          minHeight: `${pageHeight}mm`,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent ${pageHeight - 1}mm,
            rgba(200, 200, 200, 0.3) ${pageHeight - 1}mm,
            rgba(200, 200, 200, 0.3) ${pageHeight}mm
          )`
        }}
      >
      {/* Header */}
      <header
        className="mb-5 pb-4"
        style={{ borderBottom: `2px solid ${accentColor}` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{name}</h1>
            {content.tagline && (
              <p className="text-sm font-medium mb-2" style={{ color: accentColor }}>
                {content.tagline}
              </p>
            )}
            <div className="text-xs text-gray-500 flex flex-wrap gap-3">
              {userProfile?.email && <span>{userProfile.email}</span>}
              {userProfile?.phone && <span>{userProfile.phone}</span>}
              {userProfile?.location && <span>{userProfile.location}</span>}
              {userProfile?.linkedin_url && <span>LinkedIn</span>}
              {userProfile?.github_url && <span>GitHub</span>}
            </div>
          </div>
          {showPhoto && (
            photoElement || (
              <Avatar className="h-24 w-24 flex-shrink-0">
                <AvatarImage src={photoUrl} alt={name} />
                <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
              </Avatar>
            )
          )}
        </div>
      </header>

      {/* Profile */}
      {content.profile && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wide mb-2 pb-1 border-b border-gray-200"
            style={{ color: accentColor }}
          >
            {labels.profile}
          </h2>
          <p className="text-gray-700 text-justify">{content.profile}</p>
        </section>
      )}

      {/* Work Experience */}
      {selectedWorkExperiences.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wide mb-2 pb-1 border-b border-gray-200"
            style={{ color: accentColor }}
          >
            {labels.workExperience}
          </h2>
          <div className="space-y-3">
            {selectedWorkExperiences.map((exp) => {
              // Use override or fall back to profile description
              const description = exp.selection.description_override ?? exp.description;
              // Filter bullets based on selection
              const bullets = exp.selection.selected_bullet_indices === null
                ? exp.bullets
                : (exp.bullets || []).filter((_, i) =>
                    exp.selection.selected_bullet_indices!.includes(i)
                  );

              return (
                <div key={exp.id} className="text-sm">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{exp.title}</span>
                      {exp.selection.is_favorite && (
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
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
                  {description && (
                    <p className="text-gray-700 mt-1">{description}</p>
                  )}
                  {bullets && bullets.length > 0 && (
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-700">
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
      )}

      {/* Education */}
      {selectedEducations.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wide mb-2 pb-1 border-b border-gray-200"
            style={{ color: accentColor }}
          >
            {labels.education}
          </h2>
          <div className="space-y-3">
            {selectedEducations.map((edu) => {
              const description = edu.selection.description_override ?? edu.description;

              return (
                <div key={edu.id} className="text-sm">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{edu.degree}</span>
                      {edu.selection.is_favorite && (
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDateRange(edu.start_date, edu.end_date)}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {edu.institution}
                    {edu.field && ` \u2022 ${edu.field}`}
                  </p>
                  {edu.grade && (
                    <p className="text-gray-500 text-xs">{edu.grade}</p>
                  )}
                  {description && (
                    <p className="text-gray-700 mt-1">{description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Skills */}
      {selectedSkillCategories.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wide mb-2 pb-1 border-b border-gray-200"
            style={{ color: accentColor }}
          >
            {labels.skills}
          </h2>
          <div className="space-y-2">
            {selectedSkillCategories.map((cat) => {
              // Filter skills based on selection
              const skills = cat.selection.selected_skill_indices === null
                ? cat.skills
                : cat.skills.filter((_, i) =>
                    cat.selection.selected_skill_indices!.includes(i)
                  );

              return (
                <div key={cat.id} className="text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{cat.category}:</span>
                    {cat.selection.is_favorite && (
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-gray-700">
                    {skills.join(', ')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Key Competences */}
      {selectedKeyCompetences.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wide mb-2 pb-1 border-b border-gray-200"
            style={{ color: accentColor }}
          >
            {labels.keyCompetences}
          </h2>
          <div className="space-y-2">
            {selectedKeyCompetences.map((comp) => {
              const description = comp.selection.description_override ?? comp.description;

              return (
                <div key={comp.id} className="text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{comp.title}</span>
                    {comp.selection.is_favorite && (
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  {description && (
                    <p className="text-gray-700">{description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!content.profile && selectedWorkExperiences.length === 0 && selectedEducations.length === 0 && selectedSkillCategories.length === 0 && selectedKeyCompetences.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">
              {language === 'de'
                ? 'Beginnen Sie mit der Bearbeitung Ihres Lebenslaufs, um eine Vorschau zu sehen'
                : 'Start editing your CV to see a preview'}
            </p>
          </div>
        )}
      </div>

      {/* Page info */}
      <div className="text-center mt-4">
        <p className="text-xs text-muted-foreground">
          {format} format • Scroll to see all pages
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {language === 'de'
            ? 'Seitenumbrüche werden durch horizontale Linien angezeigt'
            : 'Page breaks indicated by horizontal lines'}
        </p>
      </div>
    </div>
  );
}
