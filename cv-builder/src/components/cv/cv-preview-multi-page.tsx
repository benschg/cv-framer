'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { CVContent, UserProfile, DisplaySettings } from '@/types/cv.types';
import type { CVWorkExperienceWithSelection, CVEducationWithSelection, CVSkillCategoryWithSelection, CVKeyCompetenceWithSelection } from '@/types/profile-career.types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';
import { formatDateRange } from '@/lib/utils';
import { getDisplayModeContent } from '@/lib/cv-display-mode';
import { filterSelectedSkills } from '@/lib/cv-skill-filter';
import { CVSectionHeader } from './cv-section-header';
import { CVPageBreak } from './cv-page-break';
import { CVWorkExperienceItem } from './cv-work-experience-item';
import { CVEducationItem } from './cv-education-item';
import { CVSkillCategoryItem } from './cv-skill-category-item';
import { CVKeyCompetenceItem } from './cv-key-competence-item';

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

  // Helper: Render page break
  const renderPageBreak = (sectionId: string, type: 'section' | 'item') => (
    <CVPageBreak
      sectionId={sectionId}
      type={type}
      isActive={pageBreaks.includes(sectionId)}
      onToggle={onPageBreakToggle}
    />
  );

  // Helper: Render section header
  const renderSectionHeader = (title: string) => <CVSectionHeader title={title} accentColor={accentColor} />;

  // Build sections array
  const sections: SectionDefinition[] = [headerSection];

  // Profile section
  if (content.profile) {
    sections.push({
      id: 'profile',
      canBreak: true,
      content: (
        <section className="mb-5 relative">
          {renderSectionHeader(labels.profile)}
          <p className="text-gray-700 text-justify">{content.profile}</p>
          {renderPageBreak('profile', 'section')}
        </section>
      ),
    });
  }

  // Work Experience section
  if (selectedWorkExperiences.length > 0) {
    // Section header (non-breakable)
    sections.push({
      id: 'workExperienceHeader',
      canBreak: false,
      content: renderSectionHeader(labels.workExperience),
    });

    // Each work experience item
    selectedWorkExperiences.forEach((exp, index) => {
      const isLast = index === selectedWorkExperiences.length - 1;
      const displayMode = exp.selection.display_mode || 'custom';
      const { description, bullets } = getDisplayModeContent(exp, displayMode);

      sections.push({
        id: isLast ? 'workExperience' : `workExperience-${exp.id}`,
        canBreak: true,
        content: (
          <div className={`relative ${isLast ? 'mb-5' : 'mb-3'}`}>
            <CVWorkExperienceItem experience={exp} description={description} bullets={bullets} />
            {renderPageBreak(isLast ? 'workExperience' : `workExperience-${exp.id}`, isLast ? 'section' : 'item')}
          </div>
        ),
      });
    });
  }

  // Education section
  if (selectedEducations.length > 0) {
    // Section header (non-breakable)
    sections.push({
      id: 'educationHeader',
      canBreak: false,
      content: renderSectionHeader(labels.education),
    });

    // Each education item
    selectedEducations.forEach((edu, index) => {
      const isLast = index === selectedEducations.length - 1;
      const description = edu.selection.description_override ?? edu.description;

      sections.push({
        id: isLast ? 'education' : `education-${edu.id}`,
        canBreak: true,
        content: (
          <div className={`relative ${isLast ? 'mb-5' : 'mb-3'}`}>
            <CVEducationItem education={edu} description={description} />
            {renderPageBreak(isLast ? 'education' : `education-${edu.id}`, isLast ? 'section' : 'item')}
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
        <section className="mb-5 relative">
          {renderSectionHeader(labels.skills)}
          <div className="space-y-2">
            {selectedSkillCategories.map((cat) => (
              <CVSkillCategoryItem
                key={cat.id}
                category={cat.category}
                skills={filterSelectedSkills(cat.skills, cat.selection.selected_skill_indices)}
                isFavorite={cat.selection.is_favorite}
              />
            ))}
          </div>
          {renderPageBreak('skills', 'section')}
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
        <section className="mb-5 relative">
          {renderSectionHeader(labels.keyCompetences)}
          <div className="space-y-2">
            {selectedKeyCompetences.map((comp) => (
              <CVKeyCompetenceItem
                key={comp.id}
                title={comp.title}
                description={comp.selection.description_override ?? comp.description}
                isFavorite={comp.selection.is_favorite}
              />
            ))}
          </div>
          {renderPageBreak('keyCompetences', 'section')}
        </section>
      ),
    });
  }

  // Distribute sections across pages based on page breaks
  const pages: SectionDefinition[][] = [[]];
  let currentPageIndex = 0;

  sections.forEach((section, index) => {
    pages[currentPageIndex].push(section);

    // Start a new page after this section if it has a page break
    if (section.canBreak && pageBreaks.includes(section.id) && index < sections.length - 1) {
      currentPageIndex++;
      pages[currentPageIndex] = [];
    }
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
