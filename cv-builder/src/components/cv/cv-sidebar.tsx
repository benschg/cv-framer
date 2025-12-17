'use client';

import type { ReactNode } from 'react';
import type { UserProfile, CVContent, LanguageSkill } from '@/types/cv.types';
import type { CVSkillCategoryWithSelection, CVEducationWithSelection } from '@/types/profile-career.types';
import type { CVSidebarSection } from '@/types/cv-layout.types';
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
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';
import { filterSelectedSkills } from '@/lib/cv-skill-filter';
import { formatDateRange } from '@/lib/utils';
import { CVSidebarSectionWrapper } from './cv-sidebar-section-wrapper';
import { CVSortableSidebarSection } from './cv-sortable-sidebar-section';

interface CVSidebarProps {
  /** Sections to render in order */
  sections: CVSidebarSection[];
  /** User profile data */
  userProfile?: UserProfile;
  /** CV content */
  content?: CVContent;
  /** Photo URL */
  photoUrl?: string | null;
  /** Skill categories with selections */
  skillCategories?: CVSkillCategoryWithSelection[];
  /** Education entries with selections */
  educations?: CVEducationWithSelection[];
  /** Whether to show photo */
  showPhoto?: boolean;
  /** Whether to show full contact details */
  showPrivateInfo?: boolean;
  /** Language for labels */
  language?: 'en' | 'de';
  /** Whether interactive mode is enabled (context menus) */
  isInteractive?: boolean;
  /** Callback when a section is moved up */
  onSectionMoveUp?: (sectionIndex: number) => void;
  /** Callback when a section is moved down */
  onSectionMoveDown?: (sectionIndex: number) => void;
  /** Callback when a section visibility is toggled */
  onSectionToggleVisibility?: (sectionType: CVSidebarSection) => void;
  /** Callback when sections are reordered via drag-and-drop */
  onSectionReorder?: (fromIndex: number, toIndex: number) => void;
}

export function CVSidebar({
  sections,
  userProfile,
  content,
  photoUrl,
  skillCategories,
  educations,
  showPhoto = true,
  showPrivateInfo = true,
  language = 'en',
  isInteractive = false,
  onSectionMoveUp,
  onSectionMoveDown,
  onSectionToggleVisibility,
  onSectionReorder,
}: CVSidebarProps) {
  // Setup drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onSectionReorder) return;

    const oldIndex = sections.indexOf(active.id as CVSidebarSection);
    const newIndex = sections.indexOf(over.id as CVSidebarSection);

    if (oldIndex !== -1 && newIndex !== -1) {
      onSectionReorder(oldIndex, newIndex);
    }
  };
  const labels = {
    contact: language === 'de' ? 'Kontakt' : 'Contact',
    skills: language === 'de' ? 'Fähigkeiten' : 'Skills',
    languages: language === 'de' ? 'Sprachen' : 'Languages',
    education: language === 'de' ? 'Ausbildung' : 'Education',
    certifications: language === 'de' ? 'Zertifikate' : 'Certifications',
    availableOnRequest: language === 'de' ? 'Vollständige Kontaktdaten auf Anfrage' : 'Full contact details available on request',
  };

  const renderSection = (sectionType: CVSidebarSection): ReactNode => {
    switch (sectionType) {
      case 'photo':
        if (!showPhoto || !photoUrl) return null;
        return (
          <div key="photo" className="cv-sidebar-photo">
            <img src={photoUrl} alt={userProfile?.first_name || 'Profile'} />
          </div>
        );

      case 'contact':
        return (
          <div key="contact" className="cv-sidebar-section">
            <h3 className="cv-sidebar-title">{labels.contact}</h3>
            <div className="cv-sidebar-contact">
              {showPrivateInfo ? (
                <>
                  {userProfile?.email && (
                    <div className="cv-sidebar-contact-item">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span>{userProfile.email}</span>
                    </div>
                  )}
                  {userProfile?.phone && (
                    <div className="cv-sidebar-contact-item">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span>{userProfile.phone}</span>
                    </div>
                  )}
                  {userProfile?.location && (
                    <div className="cv-sidebar-contact-item">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span>{userProfile.location}</span>
                    </div>
                  )}
                  {userProfile?.linkedin_url && (
                    <div className="cv-sidebar-contact-item">
                      <Linkedin className="h-3 w-3 flex-shrink-0" />
                      <span>LinkedIn</span>
                    </div>
                  )}
                  {userProfile?.website_url && (
                    <div className="cv-sidebar-contact-item">
                      <Globe className="h-3 w-3 flex-shrink-0" />
                      <span>{userProfile.website_url}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {userProfile?.website_url && (
                    <div className="cv-sidebar-contact-item">
                      <Globe className="h-3 w-3 flex-shrink-0" />
                      <span>{userProfile.website_url}</span>
                    </div>
                  )}
                  <p className="text-xs text-[var(--cv-text-muted)] italic">
                    {labels.availableOnRequest}
                  </p>
                </>
              )}
            </div>
          </div>
        );

      case 'skills':
        if (!skillCategories || skillCategories.length === 0) return null;
        const selectedCategories = skillCategories.filter(cat => cat.selection.is_selected);
        if (selectedCategories.length === 0) return null;

        // Flatten all skills for compact sidebar display
        const allSkills = selectedCategories.flatMap((cat) =>
          filterSelectedSkills(cat.skills, cat.selection.selected_skill_indices)
        );

        return (
          <div key="skills" className="cv-sidebar-section">
            <h3 className="cv-sidebar-title">{labels.skills}</h3>
            <div className="cv-sidebar-skills">
              {allSkills.map((skill, i) => (
                <span key={i} className="cv-sidebar-skill">{skill}</span>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (!content?.languages || content.languages.length === 0) return null;
        return (
          <div key="languages" className="cv-sidebar-section">
            <h3 className="cv-sidebar-title">{labels.languages}</h3>
            <div className="cv-sidebar-languages">
              {content.languages.map((lang) => (
                <div key={lang.id} className="cv-sidebar-language">
                  <span className="cv-sidebar-language-name">{lang.name}</span>
                  <span className="cv-sidebar-language-level">{formatLanguageLevel(lang.level, language)}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (!educations || educations.length === 0) return null;
        const selectedEducations = educations.filter(edu => edu.selection.is_selected);
        if (selectedEducations.length === 0) return null;

        return (
          <div key="education" className="cv-sidebar-section">
            <h3 className="cv-sidebar-title">{labels.education}</h3>
            <div className="cv-sidebar-list">
              {selectedEducations.map((edu) => (
                <div key={edu.id} className="cv-sidebar-list-item">
                  <span className="cv-sidebar-list-title">{edu.degree}</span>
                  <span className="cv-sidebar-list-subtitle">{edu.institution}</span>
                  <span className="cv-sidebar-list-year">
                    {formatDateRange(edu.start_date, edu.end_date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!content?.certifications || content.certifications.length === 0) return null;
        return (
          <div key="certifications" className="cv-sidebar-section">
            <h3 className="cv-sidebar-title">{labels.certifications}</h3>
            <div className="cv-sidebar-list">
              {content.certifications.map((cert) => (
                <div key={cert.id} className="cv-sidebar-list-item">
                  <span className="cv-sidebar-list-title">{cert.name}</span>
                  <span className="cv-sidebar-list-subtitle">{cert.issuer}</span>
                  {cert.date && <span className="cv-sidebar-list-year">{cert.date}</span>}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Wrap each section in the context menu wrapper if interactive
  const wrapSection = (
    sectionType: CVSidebarSection,
    sectionIndex: number,
    sectionContent: ReactNode
  ): ReactNode => {
    if (!sectionContent) return null;

    if (isInteractive) {
      return (
        <CVSortableSidebarSection
          key={sectionType}
          id={sectionType}
          disabled={!isInteractive}
        >
          <CVSidebarSectionWrapper
            sectionType={sectionType}
            sectionIndex={sectionIndex}
            totalSections={sections.length}
            onMoveUp={onSectionMoveUp}
            onMoveDown={onSectionMoveDown}
            onToggleVisibility={onSectionToggleVisibility}
            isInteractive={isInteractive}
            language={language}
          >
            {sectionContent}
          </CVSidebarSectionWrapper>
        </CVSortableSidebarSection>
      );
    }

    return sectionContent;
  };

  // Filter out sections without content for sortable context
  const visibleSections = sections.filter(section => renderSection(section) !== null);

  if (isInteractive) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleSections}
          strategy={verticalListSortingStrategy}
        >
          <div className="cv-sidebar">
            {sections.map((sectionType, index) => wrapSection(sectionType, index, renderSection(sectionType)))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <div className="cv-sidebar">
      {sections.map((sectionType, index) => wrapSection(sectionType, index, renderSection(sectionType)))}
    </div>
  );
}

function formatLanguageLevel(level: LanguageSkill['level'], language: 'en' | 'de'): string {
  const labels: Record<LanguageSkill['level'], { en: string; de: string }> = {
    native: { en: 'Native', de: 'Muttersprache' },
    fluent: { en: 'Fluent', de: 'Fließend' },
    advanced: { en: 'Advanced', de: 'Fortgeschritten' },
    intermediate: { en: 'Intermediate', de: 'Mittelstufe' },
    basic: { en: 'Basic', de: 'Grundkenntnisse' },
  };
  return labels[level][language];
}
