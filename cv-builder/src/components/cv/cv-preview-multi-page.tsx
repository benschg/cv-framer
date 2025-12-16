'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { CVContent, UserProfile, DisplaySettings } from '@/types/cv.types';
import type { CVWorkExperienceWithSelection, CVEducationWithSelection, CVSkillCategoryWithSelection, CVKeyCompetenceWithSelection } from '@/types/profile-career.types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';
import { formatDateRange } from '@/lib/utils';
import { PageBreakButton } from './page-break-button';

interface CVPreviewMultiPageProps {
  content: CVContent;
  userProfile?: UserProfile;
  settings?: Partial<DisplaySettings> | null;
  language?: 'en' | 'de';
  photoUrl?: string | null;
  userInitials?: string;
  photoElement?: ReactNode;
  workExperiences?: CVWorkExperienceWithSelection[];
  educations?: CVEducationWithSelection[];
  skillCategories?: CVSkillCategoryWithSelection[];
  keyCompetences?: CVKeyCompetenceWithSelection[];
  onPageBreakToggle?: (sectionId: string) => void;
}

interface SectionDefinition {
  id: string;
  content: ReactNode;
  canBreak: boolean;
}

export function CVPreviewMultiPage({
  content,
  userProfile,
  settings,
  language = 'en',
  photoUrl,
  userInitials = 'U',
  photoElement,
  workExperiences,
  educations,
  skillCategories,
  keyCompetences,
  onPageBreakToggle,
}: CVPreviewMultiPageProps) {
  const pagesRef = useRef<HTMLDivElement[]>([]);

  const accentColor = settings?.accentColor || '#2563eb';
  const textColor = settings?.textColor || '#111827';
  const fontFamily = settings?.fontFamily || 'sans-serif';
  const showPhoto = settings?.showPhoto !== false && photoUrl;
  const format = settings?.format || 'A4';
  const pageBreaks = settings?.pageBreaks || [];

  // Page dimensions in mm
  const pageDimensions = {
    A4: { width: 210, height: 297 },
    Letter: { width: 216, height: 279 },
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

  // Filter sections
  const showWorkExperience = settings?.showWorkExperience !== false;
  const showEducation = settings?.showEducation !== false;
  const showSkills = settings?.showSkills !== false;
  const showKeyCompetences = settings?.showKeyCompetences !== false;

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

  // Check overflow on pages
  const checkOverflow = useCallback(() => {
    pagesRef.current.forEach((page, index) => {
      if (!page) return;
      const hasOverflow = page.scrollHeight > page.clientHeight + 2;
      page.classList.toggle('cv-page-overflow', hasOverflow);
    });
  }, []);

  useEffect(() => {
    checkOverflow();
    const timeout1 = setTimeout(checkOverflow, 100);
    const timeout2 = setTimeout(checkOverflow, 500);
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [content, workExperiences, educations, skillCategories, keyCompetences, pageBreaks, checkOverflow]);

  // Header section (always on first page)
  const headerSection: SectionDefinition = {
    id: 'header',
    canBreak: false,
    content: (
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
    ),
  };

  // Build sections array
  const sections: SectionDefinition[] = [headerSection];

  // Profile section
  if (content.profile) {
    sections.push({
      id: 'profile',
      canBreak: true,
      content: (
        <section className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2
              className="text-xs font-bold uppercase tracking-wide pb-1 border-b border-gray-200 flex-1"
              style={{ color: accentColor }}
            >
              {labels.profile}
            </h2>
            {onPageBreakToggle && (
              <PageBreakButton
                sectionId="profile"
                isActive={pageBreaks.includes('profile')}
                onClick={() => onPageBreakToggle('profile')}
                type="section"
              />
            )}
          </div>
          <p className="text-gray-700 text-justify">{content.profile}</p>
        </section>
      ),
    });
  }

  // Work Experience section - with header
  if (selectedWorkExperiences.length > 0) {
    // First, add the section header with page break control
    sections.push({
      id: 'workExperience',
      canBreak: true,
      content: (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2
              className="text-xs font-bold uppercase tracking-wide pb-1 border-b border-gray-200 flex-1"
              style={{ color: accentColor }}
            >
              {labels.workExperience}
            </h2>
            {onPageBreakToggle && (
              <PageBreakButton
                sectionId="workExperience"
                isActive={pageBreaks.includes('workExperience')}
                onClick={() => onPageBreakToggle('workExperience')}
                type="section"
              />
            )}
          </div>
        </div>
      ),
    });

    // Then add each work experience as a separate section with its own page break control
    selectedWorkExperiences.forEach((exp, index) => {
      const displayMode = exp.selection.display_mode || 'custom'; // Default to custom for backwards compatibility

      // Determine what to show based on display mode
      let description: string | null = null;
      let bullets: string[] | null = null;

      if (displayMode === 'simple') {
        // Simple mode: no description, no bullets
        description = null;
        bullets = null;
      } else if (displayMode === 'with_description') {
        // With description mode: show description (or override), but no bullets
        description = exp.selection.description_override ?? exp.description;
        bullets = null;
      } else if (displayMode === 'custom') {
        // Custom mode: respect override and bullet selection
        description = exp.selection.description_override ?? exp.description;
        bullets = exp.selection.selected_bullet_indices === null
          ? exp.bullets
          : (exp.bullets || []).filter((_, i) =>
              exp.selection.selected_bullet_indices!.includes(i)
            );
      }

      sections.push({
        id: `workExperience-${exp.id}`,
        canBreak: true,
        content: (
          <div className={`relative ${index === selectedWorkExperiences.length - 1 ? 'mb-5' : 'mb-3'}`}>
            {onPageBreakToggle && index > 0 && (
              <div className="absolute -top-2 z-10" style={{ right: '-2cm' }}>
                <PageBreakButton
                  sectionId={`workExperience-${exp.id}`}
                  isActive={pageBreaks.includes(`workExperience-${exp.id}`)}
                  onClick={() => onPageBreakToggle(`workExperience-${exp.id}`)}
                  type="item"
                />
              </div>
            )}
            <div className="text-sm">
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
          </div>
        ),
      });
    });
  }

  // Education section - with header
  if (selectedEducations.length > 0) {
    // First, add the section header with page break control
    sections.push({
      id: 'education',
      canBreak: true,
      content: (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2
              className="text-xs font-bold uppercase tracking-wide pb-1 border-b border-gray-200 flex-1"
              style={{ color: accentColor }}
            >
              {labels.education}
            </h2>
            {onPageBreakToggle && (
              <PageBreakButton
                sectionId="education"
                isActive={pageBreaks.includes('education')}
                onClick={() => onPageBreakToggle('education')}
                type="section"
              />
            )}
          </div>
        </div>
      ),
    });

    // Then add each education as a separate section with its own page break control
    selectedEducations.forEach((edu, index) => {
      const description = edu.selection.description_override ?? edu.description;

      sections.push({
        id: `education-${edu.id}`,
        canBreak: true,
        content: (
          <div className={`relative ${index === selectedEducations.length - 1 ? 'mb-5' : 'mb-3'}`}>
            {onPageBreakToggle && index > 0 && (
              <div className="absolute -top-2 z-10" style={{ right: '-2cm' }}>
                <PageBreakButton
                  sectionId={`education-${edu.id}`}
                  isActive={pageBreaks.includes(`education-${edu.id}`)}
                  onClick={() => onPageBreakToggle(`education-${edu.id}`)}
                  type="item"
                />
              </div>
            )}
            <div className="text-sm">
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
                {edu.field && ` • ${edu.field}`}
              </p>
              {edu.grade && (
                <p className="text-gray-500 text-xs">{edu.grade}</p>
              )}
              {description && (
                <p className="text-gray-700 mt-1">{description}</p>
              )}
            </div>
          </div>
        ),
      });
    });
  }

  // Skills section
  if (selectedSkillCategories.length > 0) {
    sections.push({
      id: 'skills',
      canBreak: true,
      content: (
        <section className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2
              className="text-xs font-bold uppercase tracking-wide pb-1 border-b border-gray-200 flex-1"
              style={{ color: accentColor }}
            >
              {labels.skills}
            </h2>
            {onPageBreakToggle && (
              <PageBreakButton
                sectionId="skills"
                isActive={pageBreaks.includes('skills')}
                onClick={() => onPageBreakToggle('skills')}
                type="section"
              />
            )}
          </div>
          <div className="space-y-2">
            {selectedSkillCategories.map((cat) => {
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
      ),
    });
  }

  // Key Competences section
  if (selectedKeyCompetences.length > 0) {
    sections.push({
      id: 'keyCompetences',
      canBreak: true,
      content: (
        <section className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2
              className="text-xs font-bold uppercase tracking-wide pb-1 border-b border-gray-200 flex-1"
              style={{ color: accentColor }}
            >
              {labels.keyCompetences}
            </h2>
            {onPageBreakToggle && (
              <PageBreakButton
                sectionId="keyCompetences"
                isActive={pageBreaks.includes('keyCompetences')}
                onClick={() => onPageBreakToggle('keyCompetences')}
                type="section"
              />
            )}
          </div>
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
      ),
    });
  }

  // Distribute sections across pages based on page breaks
  const pages: SectionDefinition[][] = [[]];
  let currentPageIndex = 0;

  sections.forEach((section) => {
    // Start a new page if this section has a page break
    if (section.canBreak && pageBreaks.includes(section.id) && pages[currentPageIndex].length > 0) {
      currentPageIndex++;
      pages[currentPageIndex] = [];
    }
    pages[currentPageIndex].push(section);
  });

  // Empty state
  if (sections.length <= 1) {
    return (
      <div
        className="bg-white rounded-lg shadow-sm border mx-auto p-8 text-[10pt] leading-relaxed"
        style={{
          width: `${pageWidth}mm`,
          height: `${pageHeight}mm`,
          fontFamily: fontFamily,
          color: textColor,
        }}
      >
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">
            {language === 'de'
              ? 'Beginnen Sie mit der Bearbeitung Ihres Lebenslaufs, um eine Vorschau zu sehen'
              : 'Start editing your CV to see a preview'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      style={{
        fontFamily: fontFamily,
        color: textColor,
      }}
    >
      {pages.map((pageSections, pageIndex) => (
        <div key={pageIndex} style={{ overflow: 'visible' }}>
          <div
            ref={(el) => {
              if (el) pagesRef.current[pageIndex] = el;
            }}
            className="bg-white rounded-lg shadow-sm border mx-auto p-8 text-[10pt] leading-relaxed print:shadow-none print:border-0 cv-page"
            style={{
              width: `${pageWidth}mm`,
              height: `${pageHeight}mm`,
              maxHeight: `${pageHeight}mm`,
              overflow: 'visible',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {pageSections.map((section) => (
              <div key={section.id}>{section.content}</div>
            ))}
          </div>

          {/* Page info */}
          <div className="text-center mt-2">
            <p className="text-xs text-muted-foreground">
              Page {pageIndex + 1} of {pages.length}
            </p>
          </div>
        </div>
      ))}

      <style jsx global>{`
        .cv-page-overflow {
          box-shadow: inset 0 -5px 15px rgba(255, 68, 68, 0.3) !important;
          border-bottom: 3px solid #ff4444 !important;
        }
      `}</style>
    </div>
  );
}
