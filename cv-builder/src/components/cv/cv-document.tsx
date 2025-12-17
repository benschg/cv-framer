'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import type { CVContent, UserProfile, DisplaySettings } from '@/types/cv.types';
import type {
  CVWorkExperienceWithSelection,
  CVEducationWithSelection,
  CVSkillCategoryWithSelection,
  CVKeyCompetenceWithSelection,
} from '@/types/profile-career.types';
import type { CVLayoutConfig, CVMainSection, CVSidebarSection, CVPageLayout } from '@/types/cv-layout.types';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CVPage } from './cv-page';
import { CVSidebar } from './cv-sidebar';
import { CVSectionWrapper } from './cv-section-wrapper';
import { CVPageContextMenu } from './cv-page-context-menu';
import { CVSortableSection } from './cv-sortable-section';
import {
  CVHeaderSection,
  CVProfileSection,
  CVExperienceSection,
  CVEducationSection,
  CVSkillsSection,
  CVKeyCompetencesSection,
} from './sections';
import { getDefaultLayout } from '@/lib/cv-layouts';
import type { PhotoOption } from './cv-sidebar-section-context-menu';

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
  /** Enable interactive section editing (context menus, reordering) */
  isInteractive?: boolean;
  /** Callback when a section is moved */
  onSectionMove?: (pageIndex: number, fromIndex: number, toIndex: number) => void;
  /** Callback when section visibility is toggled */
  onSectionToggleVisibility?: (sectionType: CVMainSection) => void;
  /** Callback when page properties is requested (via context menu) */
  onPageProperties?: (pageIndex: number) => void;
  /** Callback when a sidebar section is moved */
  onSidebarSectionMove?: (pageIndex: number, fromIndex: number, toIndex: number) => void;
  /** Callback when sidebar section visibility is toggled */
  onSidebarSectionToggleVisibility?: (sectionType: CVSidebarSection) => void;
  /** Photo options for the context menu submenu */
  photoOptions?: PhotoOption[];
  /** Currently selected photo ID */
  selectedPhotoId?: string | null;
  /** Callback when a photo is selected */
  onPhotoSelect?: (photoId: string | null) => void;
  /** User initials for avatar fallback */
  userInitials?: string;
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
      isInteractive = false,
      onSectionMove,
      onSectionToggleVisibility,
      onPageProperties,
      onSidebarSectionMove,
      onSidebarSectionToggleVisibility,
      photoOptions,
      selectedPhotoId,
      onPhotoSelect,
      userInitials,
    },
    ref
  ) => {
    const theme = settings?.theme || 'light';
    const format = settings?.format || 'A4';
    const layoutMode = settings?.layoutMode || 'two-column';
    const showPhoto = settings?.showPhoto !== false && !!photoUrl;
    const showWorkExperience = settings?.showWorkExperience !== false;
    const showEducation = settings?.showEducation !== false;
    const showSkills = settings?.showSkills !== false;
    const showKeyCompetences = settings?.showKeyCompetences !== false;
    const privacyLevel = settings?.privacyLevel || 'personal';
    const accentColor = settings?.accentColor || '#2563eb';
    const fontFamily = settings?.fontFamily || 'Inter';
    const pageBreaks = settings?.pageBreaks || [];
    const pageLayouts = settings?.pageLayouts || [];

    // Setup drag sensors
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      })
    );

    // Handle main section drag end
    const handleMainDragEnd = (pageIndex: number, visibleSections: CVMainSection[]) => (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !onSectionMove) return;

      const oldIndex = visibleSections.indexOf(active.id as CVMainSection);
      const newIndex = visibleSections.indexOf(over.id as CVMainSection);

      if (oldIndex !== -1 && newIndex !== -1) {
        onSectionMove(pageIndex, oldIndex, newIndex);
      }
    };

    // Use provided layout or default, then apply page layout overrides
    const baseLayout = layoutConfig || getDefaultLayout(layoutMode);
    const layout = {
      ...baseLayout,
      pages: baseLayout.pages.map((page, index) => ({
        ...page,
        // Apply custom section configurations if provided
        sidebar: (pageLayouts[index]?.sidebar as CVSidebarSection[] | undefined) ?? page.sidebar,
        main: (pageLayouts[index]?.main as CVMainSection[] | undefined) ?? page.main,
        sidebarPosition: pageLayouts[index]?.sidebarPosition ?? page.sidebarPosition,
      })),
    };

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

    // Handle section move up
    const handleMoveUp = (pageIndex: number, sectionIndex: number) => {
      if (sectionIndex > 0 && onSectionMove) {
        onSectionMove(pageIndex, sectionIndex, sectionIndex - 1);
      }
    };

    // Handle section move down
    const handleMoveDown = (pageIndex: number, sectionIndex: number) => {
      if (onSectionMove) {
        onSectionMove(pageIndex, sectionIndex, sectionIndex + 1);
      }
    };

    // Handle sidebar section move up
    const handleSidebarMoveUp = (pageIndex: number) => (sectionIndex: number) => {
      if (sectionIndex > 0 && onSidebarSectionMove) {
        onSidebarSectionMove(pageIndex, sectionIndex, sectionIndex - 1);
      }
    };

    // Handle sidebar section move down
    const handleSidebarMoveDown = (pageIndex: number) => (sectionIndex: number) => {
      if (onSidebarSectionMove) {
        onSidebarSectionMove(pageIndex, sectionIndex, sectionIndex + 1);
      }
    };

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
          const isFirstPage = pageIndex === 0;

          // Determine sidebar position (default to 'left' if sidebar has content and mode is two-column)
          const sidebarPosition = pageLayout.sidebarPosition ??
            (pageLayout.sidebar.length > 0 && layout.mode === 'two-column' ? 'left' : 'none');
          const hasSidebar = sidebarPosition !== 'none' && pageLayout.sidebar.length > 0;
          const sidebarClass = sidebarPosition === 'right' ? 'cv-two-column cv-sidebar-right' : 'cv-two-column';

          // Filter out sections with no content for proper indexing
          const visibleSections = pageLayout.main.filter(section => {
            const rendered = renderMainSection(section);
            return rendered !== null;
          });

          const renderWrappedSection = (sectionType: CVMainSection) => {
            const sectionContent = renderMainSection(sectionType);
            if (!sectionContent) return null;

            const visibleIndex = visibleSections.indexOf(sectionType);

            return (
              <CVSortableSection
                key={sectionType}
                id={sectionType}
                disabled={!isInteractive}
              >
                <CVSectionWrapper
                  sectionType={sectionType}
                  sectionIndex={visibleIndex}
                  totalSections={visibleSections.length}
                  pageIndex={pageIndex}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onToggleVisibility={onSectionToggleVisibility}
                  onPageProperties={onPageProperties}
                  isInteractive={isInteractive}
                >
                  {sectionContent}
                </CVSectionWrapper>
              </CVSortableSection>
            );
          };

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
              <CVPageContextMenu
                pageIndex={pageIndex}
                onPageProperties={onPageProperties}
                disabled={!isInteractive}
              >
                {hasSidebar ? (
                  <div className={sidebarClass}>
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
                      isInteractive={isInteractive}
                      onSectionMoveUp={handleSidebarMoveUp(pageIndex)}
                      onSectionMoveDown={handleSidebarMoveDown(pageIndex)}
                      onSectionToggleVisibility={onSidebarSectionToggleVisibility}
                      onSectionReorder={(fromIndex, toIndex) => {
                        if (onSidebarSectionMove) {
                          onSidebarSectionMove(pageIndex, fromIndex, toIndex);
                        }
                      }}
                      photoOptions={photoOptions}
                      selectedPhotoId={selectedPhotoId}
                      onPhotoSelect={onPhotoSelect}
                      userInitials={userInitials}
                    />
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleMainDragEnd(pageIndex, visibleSections)}
                    >
                      <SortableContext
                        items={visibleSections}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="cv-main-content">
                          {pageLayout.main.map((sectionType) => renderWrappedSection(sectionType))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleMainDragEnd(pageIndex, visibleSections)}
                  >
                    <SortableContext
                      items={visibleSections}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="cv-main-content cv-full-width">
                        {pageLayout.main.map((sectionType) => renderWrappedSection(sectionType))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CVPageContextMenu>
            </CVPage>
          );
        })}
      </div>
    );
  }
);

CVDocument.displayName = 'CVDocument';
