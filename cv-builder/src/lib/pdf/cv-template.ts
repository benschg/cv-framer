import type { CVContent, CVDocument, UserProfile, DisplaySettings, LanguageSkill } from '@/types/cv.types';
import type {
  CVWorkExperienceWithSelection,
  CVEducationWithSelection,
  CVSkillCategoryWithSelection,
  CVKeyCompetenceWithSelection,
} from '@/types/profile-career.types';
import type { CVLayoutConfig, CVMainSection, CVSidebarSection } from '@/types/cv-layout.types';
import { getDefaultLayout } from '@/lib/cv-layouts';
import { getDisplayModeContent } from '@/lib/cv-display-mode';
import { filterSelectedSkills } from '@/lib/cv-skill-filter';
import { formatDateRange } from '@/lib/utils';

export interface CVTemplateData {
  cv: CVDocument;
  userProfile?: UserProfile;
  photoUrl?: string | null;
  workExperiences?: CVWorkExperienceWithSelection[];
  educations?: CVEducationWithSelection[];
  skillCategories?: CVSkillCategoryWithSelection[];
  keyCompetences?: CVKeyCompetenceWithSelection[];
  layoutConfig?: CVLayoutConfig;
}

/**
 * Generate HTML for CV PDF export
 * Produces HTML that matches the CVDocument React component structure
 */
export function generateCVHTML(data: CVTemplateData): string {
  const { cv, userProfile, photoUrl, workExperiences, educations, skillCategories, keyCompetences, layoutConfig } = data;
  const content = cv.content;
  const language = cv.language || 'en';

  const defaultSettings: DisplaySettings = {
    theme: 'light',
    format: 'A4',
    showPhoto: true,
    showAttachments: false,
    privacyLevel: 'personal',
  };
  const settings: DisplaySettings = { ...defaultSettings, ...cv.display_settings };

  const theme = settings.theme;
  const format = settings.format;
  const layoutMode = settings.layoutMode || 'two-column';
  const showPhoto = settings.showPhoto !== false && !!photoUrl;
  const showWorkExperience = settings.showWorkExperience !== false;
  const showEducation = settings.showEducation !== false;
  const showSkills = settings.showSkills !== false;
  const showKeyCompetences = settings.showKeyCompetences !== false;
  const privacyLevel = settings.privacyLevel || 'personal';
  const accentColor = settings.accentColor || '#2563eb';
  const fontFamily = settings.fontFamily || 'Inter';

  // Use provided layout or default
  const layout = layoutConfig || getDefaultLayout(layoutMode);

  // Labels
  const labels = {
    profile: language === 'de' ? 'Profil' : 'Profile',
    workExperience: language === 'de' ? 'Berufserfahrung' : 'Work Experience',
    education: language === 'de' ? 'Ausbildung' : 'Education',
    skills: language === 'de' ? 'Fähigkeiten' : 'Skills',
    keyCompetences: language === 'de' ? 'Kernkompetenzen' : 'Key Competences',
    contact: language === 'de' ? 'Kontakt' : 'Contact',
    languages: language === 'de' ? 'Sprachen' : 'Languages',
    certifications: language === 'de' ? 'Zertifikate' : 'Certifications',
    availableOnRequest: language === 'de' ? 'Vollständige Kontaktdaten auf Anfrage' : 'Full contact details available on request',
  };

  // Filter to selected items
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

  // Get CSS styles
  const styles = generateStyles(settings);

  // Generate pages HTML
  const pagesHTML = generatePages(
    layout,
    content,
    userProfile,
    photoUrl,
    selectedWorkExperiences,
    selectedEducations,
    selectedSkillCategories,
    selectedKeyCompetences,
    settings,
    labels,
    language
  );

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cv.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>${styles}</style>
</head>
<body>
  <div class="cv-document-wrapper" data-theme="${theme}" style="--cv-accent: ${accentColor}; --cv-font-family: '${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    ${pagesHTML}
  </div>
</body>
</html>
  `.trim();
}

function generateStyles(settings: DisplaySettings): string {
  const format = settings.format || 'A4';
  const pageWidth = format === 'Letter' ? '216mm' : '210mm';
  const pageHeight = format === 'Letter' ? '279mm' : '297mm';

  return `
    :root {
      --cv-page-width: ${pageWidth};
      --cv-page-height: ${pageHeight};
      --cv-page-padding: 15mm;
      --cv-content-height: calc(${pageHeight} - 30mm - 8mm);
      --cv-sidebar-width: 55mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--cv-font-family, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
      font-size: 10pt;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }

    /* Light Theme */
    .cv-document-wrapper[data-theme='light'] {
      --cv-bg-page: #ffffff;
      --cv-bg-sidebar: #f5f0ee;
      --cv-accent: #2563eb;
      --cv-text-primary: #1a1a1a;
      --cv-text-secondary: #333333;
      --cv-text-muted: #666666;
      --cv-highlight-bg: rgba(37, 99, 235, 0.08);
      --cv-skill-bg: rgba(37, 99, 235, 0.1);
      --cv-border-color: #e5e7eb;
    }

    /* Dark Theme */
    .cv-document-wrapper[data-theme='dark'] {
      --cv-bg-page: #343a40;
      --cv-bg-sidebar: #2a2e32;
      --cv-accent: #60a5fa;
      --cv-text-primary: #ffffff;
      --cv-text-secondary: #e0e0e0;
      --cv-text-muted: #b0b0b0;
      --cv-highlight-bg: rgba(96, 165, 250, 0.15);
      --cv-skill-bg: rgba(96, 165, 250, 0.2);
      --cv-border-color: rgba(96, 165, 250, 0.3);
    }

    .cv-document-wrapper {
      display: block;
      padding: 0;
      margin: 0;
    }

    .cv-page {
      width: var(--cv-page-width);
      height: var(--cv-page-height);
      background-color: var(--cv-bg-page);
      color: var(--cv-text-primary);
      box-sizing: border-box;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      page-break-after: always;
      page-break-inside: avoid;
    }

    .cv-page:last-child {
      page-break-after: auto;
    }

    .cv-page-content {
      flex: 1;
      overflow: hidden;
    }

    .cv-two-column {
      display: flex;
      height: calc(var(--cv-page-height) - 8mm);
      max-height: calc(var(--cv-page-height) - 8mm);
      overflow: hidden;
    }

    .cv-sidebar {
      width: var(--cv-sidebar-width);
      background-color: var(--cv-bg-sidebar);
      padding: 10mm 8mm;
      border-right: 3px solid var(--cv-accent);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      overflow: hidden;
    }

    .cv-main-content {
      flex: 1;
      padding: 12mm 15mm 8mm 12mm;
      overflow: hidden;
    }

    .cv-main-content.cv-full-width {
      padding: 12mm 15mm 8mm 15mm;
      height: calc(var(--cv-page-height) - 8mm);
      max-height: calc(var(--cv-page-height) - 8mm);
    }

    .cv-page-footer {
      height: 8mm;
      padding: 0 15mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--cv-border-color);
      font-size: 0.7rem;
      color: var(--cv-text-muted);
    }

    .cv-footer-contact {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .cv-footer-separator {
      color: var(--cv-accent);
      opacity: 0.5;
    }

    .cv-footer-item {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .cv-page-number {
      font-size: 0.75rem;
    }

    /* Sidebar components */
    .cv-sidebar-photo {
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .cv-sidebar-photo img {
      width: 90px;
      height: 112px;
      object-fit: cover;
      object-position: top;
      border-radius: 4px;
    }

    .cv-sidebar-section {
      margin-bottom: 0.5rem;
    }

    .cv-sidebar-title {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--cv-accent);
      margin: 0 0 0.5rem 0;
      padding-bottom: 0.25rem;
      border-bottom: 1px solid var(--cv-accent);
    }

    .cv-sidebar-skills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
    }

    .cv-sidebar-skill {
      font-size: 0.65rem;
      color: var(--cv-text-secondary);
      background-color: var(--cv-skill-bg);
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
    }

    .cv-sidebar-languages {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .cv-sidebar-language {
      display: flex;
      justify-content: space-between;
      font-size: 0.7rem;
    }

    .cv-sidebar-language-name {
      color: var(--cv-text-secondary);
    }

    .cv-sidebar-language-level {
      color: var(--cv-text-muted);
      font-style: italic;
    }

    .cv-sidebar-contact {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .cv-sidebar-contact-item {
      display: flex;
      align-items: flex-start;
      font-size: 0.65rem;
      color: var(--cv-text-muted);
      word-break: break-all;
      gap: 4px;
    }

    .cv-sidebar-list {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .cv-sidebar-list-item {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .cv-sidebar-list-title {
      font-size: 0.7rem;
      color: var(--cv-text-secondary);
      font-weight: 600;
    }

    .cv-sidebar-list-subtitle {
      font-size: 0.6rem;
      color: var(--cv-text-muted);
    }

    .cv-sidebar-list-year {
      font-size: 0.55rem;
      color: var(--cv-accent);
      font-style: italic;
    }

    /* Typography */
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
      color: var(--cv-text-primary);
    }

    h2 {
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--cv-accent);
      border-bottom: 2px solid var(--cv-accent);
      padding-bottom: 0.4rem;
      margin: 1.25rem 0 0.75rem 0;
    }

    h2:first-child {
      margin-top: 0;
    }

    h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      color: var(--cv-text-primary);
    }

    p {
      font-size: 0.85rem;
      line-height: 1.5;
      margin: 0.4rem 0;
      color: var(--cv-text-secondary);
    }

    /* Section styles */
    .cv-section {
      margin-bottom: 1rem;
    }

    .cv-header {
      margin-bottom: 1rem;
    }

    .cv-header-title {
      color: var(--cv-accent);
      font-size: 1rem;
      font-weight: 500;
      margin: 0.25rem 0 0.5rem 0;
    }

    .cv-header-contact {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.8rem;
      color: var(--cv-text-muted);
    }

    .cv-header-contact-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .cv-profile p {
      text-align: justify;
    }

    .cv-experience-entry,
    .cv-education-entry {
      margin-bottom: 0.75rem;
    }

    .cv-experience-header,
    .cv-education-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .cv-experience-period,
    .cv-education-period {
      color: var(--cv-accent);
      font-size: 0.8rem;
      font-weight: 500;
    }

    .cv-experience-company,
    .cv-education-institution {
      color: var(--cv-text-muted);
      font-size: 0.85rem;
      margin-bottom: 0.2rem;
    }

    .cv-experience-description {
      font-size: 0.85rem;
      color: var(--cv-text-secondary);
      margin: 0.25rem 0;
    }

    .cv-experience-achievements {
      list-style: none;
      padding: 0;
      margin: 0.4rem 0 0 0;
    }

    .cv-experience-achievements li {
      position: relative;
      padding-left: 1rem;
      font-size: 0.8rem;
      color: var(--cv-text-secondary);
      margin-bottom: 0.2rem;
    }

    .cv-experience-achievements li::before {
      content: '\\2022';
      position: absolute;
      left: 0;
      color: var(--cv-accent);
    }

    .cv-education-grade {
      color: var(--cv-accent);
      font-size: 0.8rem;
      font-style: italic;
    }

    .cv-skills-category {
      margin-bottom: 0.5rem;
    }

    .cv-skills-category-name {
      font-weight: 600;
      color: var(--cv-accent);
      font-size: 0.85rem;
      margin-bottom: 0.2rem;
    }

    .cv-skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .cv-skill-chip {
      background-color: var(--cv-skill-bg);
      border: 1px solid var(--cv-accent);
      color: var(--cv-text-secondary);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .cv-competence-item {
      margin-bottom: 0.5rem;
    }

    .cv-competence-title {
      font-weight: 600;
      color: var(--cv-text-primary);
      font-size: 0.9rem;
    }

    .cv-competence-description {
      font-size: 0.8rem;
      color: var(--cv-text-secondary);
      margin-top: 0.1rem;
    }

    .cv-favorite-indicator {
      color: #eab308;
      margin-left: 4px;
    }

    @media print {
      @page {
        size: ${settings.format || 'A4'};
        margin: 0;
      }

      html, body {
        margin: 0 !important;
        padding: 0 !important;
      }
    }
  `;
}

function generatePages(
  layout: CVLayoutConfig,
  content: CVContent,
  userProfile: UserProfile | undefined,
  photoUrl: string | null | undefined,
  workExperiences: CVWorkExperienceWithSelection[],
  educations: CVEducationWithSelection[],
  skillCategories: CVSkillCategoryWithSelection[],
  keyCompetences: CVKeyCompetenceWithSelection[],
  settings: DisplaySettings,
  labels: Record<string, string>,
  language: 'en' | 'de'
): string {
  const showPhoto = settings.showPhoto !== false && !!photoUrl;
  const privacyLevel = settings.privacyLevel || 'personal';

  // Calculate total pages with content
  const pagesWithContent = layout.pages.filter((page) =>
    pageHasContent(page, content, workExperiences, educations, skillCategories, keyCompetences)
  );
  const totalPages = pagesWithContent.length;

  // Footer info
  const footerEmail = privacyLevel !== 'none' ? userProfile?.email : undefined;
  const footerPhone = privacyLevel === 'full' ? userProfile?.phone : undefined;
  const footerLinkedin = userProfile?.linkedin_url ? 'LinkedIn' : undefined;
  const footerWebsite = userProfile?.website_url;

  let pageNumber = 0;

  return layout.pages
    .filter((page) =>
      pageHasContent(page, content, workExperiences, educations, skillCategories, keyCompetences)
    )
    .map((pageLayout, index) => {
      pageNumber++;
      const hasSidebar = pageLayout.sidebar.length > 0 && layout.mode === 'two-column';
      const isFirstPage = index === 0;

      const pageContent = hasSidebar
        ? `
          <div class="cv-two-column">
            ${generateSidebar(pageLayout.sidebar, userProfile, content, photoUrl, skillCategories, educations, isFirstPage && showPhoto, privacyLevel !== 'none', labels, language)}
            <div class="cv-main-content">
              ${pageLayout.main.map(section => generateMainSection(section, content, userProfile, workExperiences, educations, skillCategories, keyCompetences, labels, language)).join('')}
            </div>
          </div>
        `
        : `
          <div class="cv-main-content cv-full-width">
            ${pageLayout.main.map(section => generateMainSection(section, content, userProfile, workExperiences, educations, skillCategories, keyCompetences, labels, language)).join('')}
          </div>
        `;

      return `
        <div class="cv-page">
          <div class="cv-page-content">
            ${pageContent}
          </div>
          <div class="cv-page-footer">
            <div class="cv-footer-contact">
              ${footerEmail ? `<span class="cv-footer-item">${footerEmail}</span>` : ''}
              ${footerEmail && footerPhone ? '<span class="cv-footer-separator">|</span>' : ''}
              ${footerPhone ? `<span class="cv-footer-item">${footerPhone}</span>` : ''}
              ${(footerEmail || footerPhone) && footerLinkedin ? '<span class="cv-footer-separator">|</span>' : ''}
              ${footerLinkedin ? `<span class="cv-footer-item">${footerLinkedin}</span>` : ''}
              ${footerLinkedin && footerWebsite ? '<span class="cv-footer-separator">|</span>' : ''}
              ${footerWebsite ? `<span class="cv-footer-item">${footerWebsite}</span>` : ''}
            </div>
            <span class="cv-page-number">${pageNumber} / ${totalPages}</span>
          </div>
        </div>
      `;
    })
    .join('');
}

function pageHasContent(
  page: { sidebar: CVSidebarSection[]; main: CVMainSection[] },
  content: CVContent,
  workExperiences: CVWorkExperienceWithSelection[],
  educations: CVEducationWithSelection[],
  skillCategories: CVSkillCategoryWithSelection[],
  keyCompetences: CVKeyCompetenceWithSelection[]
): boolean {
  const mainSections = page.main.filter(section => {
    switch (section) {
      case 'header':
        return true;
      case 'profile':
        return !!content.profile;
      case 'experience':
        return workExperiences.length > 0;
      case 'education':
        return educations.length > 0;
      case 'skills':
        return skillCategories.length > 0;
      case 'keyCompetences':
        return keyCompetences.length > 0;
      default:
        return false;
    }
  });

  return mainSections.length > 0 || page.sidebar.length > 0;
}

function generateSidebar(
  sections: CVSidebarSection[],
  userProfile: UserProfile | undefined,
  content: CVContent,
  photoUrl: string | null | undefined,
  skillCategories: CVSkillCategoryWithSelection[],
  educations: CVEducationWithSelection[],
  showPhoto: boolean,
  showPrivateInfo: boolean,
  labels: Record<string, string>,
  language: 'en' | 'de'
): string {
  return `
    <div class="cv-sidebar">
      ${sections.map(section => {
        switch (section) {
          case 'photo':
            if (!showPhoto || !photoUrl) return '';
            return `
              <div class="cv-sidebar-photo">
                <img src="${photoUrl}" alt="${userProfile?.first_name || 'Profile'}" />
              </div>
            `;

          case 'contact':
            return `
              <div class="cv-sidebar-section">
                <h3 class="cv-sidebar-title">${labels.contact}</h3>
                <div class="cv-sidebar-contact">
                  ${showPrivateInfo ? `
                    ${userProfile?.email ? `<div class="cv-sidebar-contact-item">${userProfile.email}</div>` : ''}
                    ${userProfile?.phone ? `<div class="cv-sidebar-contact-item">${userProfile.phone}</div>` : ''}
                    ${userProfile?.location ? `<div class="cv-sidebar-contact-item">${userProfile.location}</div>` : ''}
                    ${userProfile?.linkedin_url ? `<div class="cv-sidebar-contact-item">LinkedIn</div>` : ''}
                    ${userProfile?.website_url ? `<div class="cv-sidebar-contact-item">${userProfile.website_url}</div>` : ''}
                  ` : `
                    ${userProfile?.website_url ? `<div class="cv-sidebar-contact-item">${userProfile.website_url}</div>` : ''}
                    <p style="font-size: 0.6rem; color: var(--cv-text-muted); font-style: italic;">${labels.availableOnRequest}</p>
                  `}
                </div>
              </div>
            `;

          case 'skills':
            if (skillCategories.length === 0) return '';
            const allSkills = skillCategories.flatMap(cat =>
              filterSelectedSkills(cat.skills, cat.selection.selected_skill_indices)
            );
            return `
              <div class="cv-sidebar-section">
                <h3 class="cv-sidebar-title">${labels.skills}</h3>
                <div class="cv-sidebar-skills">
                  ${allSkills.map(skill => `<span class="cv-sidebar-skill">${skill}</span>`).join('')}
                </div>
              </div>
            `;

          case 'languages':
            if (!content.languages || content.languages.length === 0) return '';
            return `
              <div class="cv-sidebar-section">
                <h3 class="cv-sidebar-title">${labels.languages}</h3>
                <div class="cv-sidebar-languages">
                  ${content.languages.map(lang => `
                    <div class="cv-sidebar-language">
                      <span class="cv-sidebar-language-name">${lang.name}</span>
                      <span class="cv-sidebar-language-level">${formatLanguageLevel(lang.level, language)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;

          case 'education':
            if (educations.length === 0) return '';
            return `
              <div class="cv-sidebar-section">
                <h3 class="cv-sidebar-title">${labels.education}</h3>
                <div class="cv-sidebar-list">
                  ${educations.map(edu => `
                    <div class="cv-sidebar-list-item">
                      <span class="cv-sidebar-list-title">${edu.degree}</span>
                      <span class="cv-sidebar-list-subtitle">${edu.institution}</span>
                      <span class="cv-sidebar-list-year">${formatDateRange(edu.start_date, edu.end_date)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;

          case 'certifications':
            if (!content.certifications || content.certifications.length === 0) return '';
            return `
              <div class="cv-sidebar-section">
                <h3 class="cv-sidebar-title">${labels.certifications}</h3>
                <div class="cv-sidebar-list">
                  ${content.certifications.map(cert => `
                    <div class="cv-sidebar-list-item">
                      <span class="cv-sidebar-list-title">${cert.name}</span>
                      <span class="cv-sidebar-list-subtitle">${cert.issuer}</span>
                      ${cert.date ? `<span class="cv-sidebar-list-year">${cert.date}</span>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            `;

          default:
            return '';
        }
      }).join('')}
    </div>
  `;
}

function generateMainSection(
  sectionType: CVMainSection,
  content: CVContent,
  userProfile: UserProfile | undefined,
  workExperiences: CVWorkExperienceWithSelection[],
  educations: CVEducationWithSelection[],
  skillCategories: CVSkillCategoryWithSelection[],
  keyCompetences: CVKeyCompetenceWithSelection[],
  labels: Record<string, string>,
  language: 'en' | 'de'
): string {
  const name = userProfile
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
    : language === 'de' ? 'Ihr Name' : 'Your Name';

  switch (sectionType) {
    case 'header':
      return `
        <div class="cv-header cv-section">
          <h1>${name}</h1>
          ${content.tagline ? `<p class="cv-header-title">${content.tagline}</p>` : ''}
          <div class="cv-header-contact">
            ${userProfile?.email ? `<span class="cv-header-contact-item">${userProfile.email}</span>` : ''}
            ${userProfile?.phone ? `<span class="cv-header-contact-item">${userProfile.phone}</span>` : ''}
            ${userProfile?.location ? `<span class="cv-header-contact-item">${userProfile.location}</span>` : ''}
            ${userProfile?.linkedin_url ? `<span class="cv-header-contact-item">LinkedIn</span>` : ''}
            ${userProfile?.github_url ? `<span class="cv-header-contact-item">GitHub</span>` : ''}
          </div>
        </div>
      `;

    case 'profile':
      if (!content.profile) return '';
      return `
        <section class="cv-section cv-profile">
          <h2>${labels.profile}</h2>
          <p>${content.profile}</p>
        </section>
      `;

    case 'experience':
      if (workExperiences.length === 0) return '';
      return `
        <section class="cv-section cv-experience">
          <h2>${labels.workExperience}</h2>
          ${workExperiences.map(exp => {
            const displayMode = exp.selection.display_mode || 'custom';
            const { description, bullets } = getDisplayModeContent(exp, displayMode);
            return `
              <div class="cv-experience-entry">
                <div class="cv-experience-header">
                  <h3>${exp.title}</h3>
                  <span class="cv-experience-period">${formatDateRange(exp.start_date, exp.end_date, exp.current)}</span>
                </div>
                <p class="cv-experience-company">${exp.company}${exp.location ? `, ${exp.location}` : ''}</p>
                ${description ? `<p class="cv-experience-description">${description}</p>` : ''}
                ${bullets && bullets.length > 0 ? `
                  <ul class="cv-experience-achievements">
                    ${bullets.map(bullet => `<li>${bullet}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `;
          }).join('')}
        </section>
      `;

    case 'education':
      if (educations.length === 0) return '';
      return `
        <section class="cv-section cv-education">
          <h2>${labels.education}</h2>
          ${educations.map(edu => {
            const description = edu.selection.description_override ?? edu.description;
            return `
              <div class="cv-education-entry">
                <div class="cv-education-header">
                  <h3>${edu.degree}</h3>
                  <span class="cv-education-period">${formatDateRange(edu.start_date, edu.end_date)}</span>
                </div>
                <p class="cv-education-institution">${edu.institution}${edu.field ? ` • ${edu.field}` : ''}</p>
                ${edu.grade ? `<p class="cv-education-grade">${edu.grade}</p>` : ''}
                ${description ? `<p class="cv-experience-description">${description}</p>` : ''}
              </div>
            `;
          }).join('')}
        </section>
      `;

    case 'skills':
      if (skillCategories.length === 0) return '';
      return `
        <section class="cv-section cv-skills">
          <h2>${labels.skills}</h2>
          <div class="cv-skills-categories">
            ${skillCategories.map(cat => {
              const skills = filterSelectedSkills(cat.skills, cat.selection.selected_skill_indices);
              return `
                <div class="cv-skills-category">
                  <span class="cv-skills-category-name">${cat.category}:</span>
                  <div class="cv-skills-list">
                    ${skills.map(skill => `<span class="cv-skill-chip">${skill}</span>`).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      `;

    case 'keyCompetences':
      if (keyCompetences.length === 0) return '';
      return `
        <section class="cv-section cv-key-competences">
          <h2>${labels.keyCompetences}</h2>
          <div class="cv-competences-list">
            ${keyCompetences.map(comp => {
              const description = comp.selection.description_override ?? comp.description;
              return `
                <div class="cv-competence-item">
                  <span class="cv-competence-title">${comp.title}</span>
                  ${description ? `<p class="cv-competence-description">${description}</p>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </section>
      `;

    case 'projects':
    case 'references':
      // TODO: Implement
      return '';

    default:
      return '';
  }
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
