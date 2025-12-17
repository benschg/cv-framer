'use client';

import { forwardRef, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CVContent, UserProfile, DisplaySettings } from '@/types/cv.types';
import type {
  CVWorkExperienceWithSelection,
  CVEducationWithSelection,
  CVSkillCategoryWithSelection,
  CVKeyCompetenceWithSelection,
} from '@/types/profile-career.types';
import type { CVLayoutConfig, CVMainSection, CVSidebarSection } from '@/types/cv-layout.types';
import { CVPage } from './cv-page';
import { CVSidebar } from './cv-sidebar';
import {
  CVHeaderSection,
  CVProfileSection,
  CVExperienceSection,
  CVEducationSection,
  CVSkillsSection,
  CVKeyCompetencesSection,
} from './sections';
import { getDefaultLayout } from '@/lib/cv-layouts';

interface CVDocumentProps {
  content: CVContent;
  userProfile?: UserProfile;
  settings?: Partial<DisplaySettings> | null;
  language?: 'en' | 'de';
  photoUrl?: string | null;
  /** Custom layout config - if not provided, uses default based on layoutMode */
  layoutConfig?: CVLayoutConfig;
  /** Work experiences with per-CV selections */
  workExperiences?: CVWorkExperienceWithSelection[];
  /** Educations with per-CV selections */
  educations?: CVEducationWithSelection[];
  /** Skill categories with per-CV selections */
  skillCategories?: CVSkillCategoryWithSelection[];
  /** Key competences with per-CV selections */
  keyCompetences?: CVKeyCompetenceWithSelection[];
  /** Zoom level: 0 = auto, > 0 = manual scale */
  zoom?: number;
  /** Callback when page break is toggled */
  onPageBreakToggle?: (sectionId: string) => void;
}

export const CVDocument = forwardRef<HTMLDivElement, CVDocumentProps>(
  (
    {
      content,
      userProfile,
      settings,
      language = 'en',
      photoUrl,
      layoutConfig,
      workExperiences,
      educations,
      skillCategories,
      keyCompetences,
      zoom = 0,
      onPageBreakToggle,
    },
    ref
  ) => {
    const theme = settings?.theme || 'light';
    const format = settings?.format || 'A4';
    const layoutMode = settings?.layoutMode || 'single-column';
    const showPhoto = settings?.showPhoto !== false && !!photoUrl;
    const showWorkExperience = settings?.showWorkExperience !== false;
    const showEducation = settings?.showEducation !== false;
    const showSkills = settings?.showSkills !== false;
    const showKeyCompetences = settings?.showKeyCompetences !== false;
    const privacyLevel = settings?.privacyLevel || 'personal';
    const accentColor = settings?.accentColor || '#2563eb';
    const fontFamily = settings?.fontFamily || 'Inter';
    const pageBreaks = settings?.pageBreaks || [];

    // Use provided layout or default
    const layout = layoutConfig || getDefaultLayout(layoutMode);

    // Labels based on language
    const labels = {
      profile: language === 'de' ? 'Profil' : 'Profile',
      workExperience: language === 'de' ? 'Berufserfahrung' : 'Work Experience',
      education: language === 'de' ? 'Ausbildung' : 'Education',
      skills: language === 'de' ? 'Fähigkeiten' : 'Skills',
      keyCompetences: language === 'de' ? 'Kernkompetenzen' : 'Key Competences',
    };

    // Filter to selected items only
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

    // Render a main content section
    const renderMainSection = (sectionType: CVMainSection): ReactNode => {
      switch (sectionType) {
        case 'header':
          return (
            <CVHeaderSection
              key="header"
              content={content}
              userProfile={userProfile}
              language={language}
            />
          );

        case 'profile':
          if (!content.profile) return null;
          return (
            <CVProfileSection
              key="profile"
              profile={content.profile}
              title={labels.profile}
            />
          );

        case 'experience':
          if (selectedWorkExperiences.length === 0) return null;
          return (
            <CVExperienceSection
              key="experience"
              experiences={selectedWorkExperiences}
              title={labels.workExperience}
            />
          );

        case 'education':
          if (selectedEducations.length === 0) return null;
          return (
            <CVEducationSection
              key="education"
              educations={selectedEducations}
              title={labels.education}
            />
          );

        case 'skills':
          if (selectedSkillCategories.length === 0) return null;
          return (
            <CVSkillsSection
              key="skills"
              skillCategories={selectedSkillCategories}
              title={labels.skills}
            />
          );

        case 'keyCompetences':
          if (selectedKeyCompetences.length === 0) return null;
          return (
            <CVKeyCompetencesSection
              key="keyCompetences"
              competences={selectedKeyCompetences}
              title={labels.keyCompetences}
            />
          );

        case 'projects':
          // TODO: Implement projects section
          return null;

        case 'references':
          // TODO: Implement references section
          return null;

        default:
          return null;
      }
    };

    // Determine if page has content
    const pageHasContent = (pageIndex: number): boolean => {
      const page = layout.pages[pageIndex];
      if (!page) return false;

      // Check if any main sections have content
      const mainSections = page.main.filter(section => {
        switch (section) {
          case 'header':
            return true; // Header always has content
          case 'profile':
            return !!content.profile;
          case 'experience':
            return selectedWorkExperiences.length > 0;
          case 'education':
            return selectedEducations.length > 0;
          case 'skills':
            return selectedSkillCategories.length > 0;
          case 'keyCompetences':
            return selectedKeyCompetences.length > 0;
          default:
            return false;
        }
      });

      // Check if sidebar has content
      const sidebarHasContent = page.sidebar.length > 0;

      return mainSections.length > 0 || sidebarHasContent;
    };

    // Calculate total pages (only count pages with content)
    const totalPages = layout.pages.filter((_, index) => pageHasContent(index)).length;

    // Get contact info for footer based on privacy level
    const footerEmail = privacyLevel !== 'none' ? userProfile?.email : undefined;
    const footerPhone = privacyLevel === 'full' ? userProfile?.phone : undefined;
    const footerLinkedin = userProfile?.linkedin_url ? 'linkedin.com/in/...' : undefined;
    const footerWebsite = userProfile?.website_url;

    // CSS custom properties for theming
    const cssVars = {
      '--cv-accent': accentColor,
      '--cv-font-family': `'${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    } as React.CSSProperties;

    // Empty state
    if (totalPages === 0) {
      return (
        <div
          className="cv-document-wrapper"
          data-theme={theme}
          ref={ref}
          style={cssVars}
        >
          <CVPage
            pageNumber={1}
            totalPages={1}
            format={format}
            zoom={zoom}
          >
            <div className="cv-main-content cv-full-width">
              <div className="text-center py-8 text-[var(--cv-text-muted)]">
                <p className="text-sm">
                  {language === 'de'
                    ? 'Beginnen Sie mit der Bearbeitung Ihres Lebenslaufs, um eine Vorschau zu sehen'
                    : 'Start editing your CV to see a preview'}
                </p>
              </div>
            </div>
          </CVPage>
        </div>
      );
    }

    let visiblePageNumber = 0;

    return (
      <div
        className="cv-document-wrapper"
        data-theme={theme}
        ref={ref}
        style={cssVars}
      >
        {layout.pages.map((pageLayout, pageIndex) => {
          // Skip pages without content
          if (!pageHasContent(pageIndex)) return null;

          visiblePageNumber++;
          const hasSidebar = pageLayout.sidebar.length > 0 && layout.mode === 'two-column';
          const isFirstPage = pageIndex === 0;

          return (
            <CVPage
              key={pageIndex}
              pageNumber={visiblePageNumber}
              totalPages={totalPages}
              format={format}
              email={footerEmail}
              phone={footerPhone}
              linkedin={footerLinkedin}
              website={footerWebsite}
              zoom={zoom}
            >
              {hasSidebar ? (
                <div className="cv-two-column">
                  <CVSidebar
                    sections={pageLayout.sidebar}
                    userProfile={userProfile}
                    content={content}
                    photoUrl={photoUrl}
                    skillCategories={skillCategories}
                    educations={educations}
                    showPhoto={isFirstPage && showPhoto}
                    showPrivateInfo={privacyLevel !== 'none'}
                    language={language}
                  />
                  <div className="cv-main-content">
                    {pageLayout.main.map((sectionType) => renderMainSection(sectionType))}
                  </div>
                </div>
              ) : (
                <div className="cv-main-content cv-full-width">
                  {pageLayout.main.map((sectionType) => renderMainSection(sectionType))}
                </div>
              )}
            </CVPage>
          );
        })}
      </div>
    );
  }
);

CVDocument.displayName = 'CVDocument';
