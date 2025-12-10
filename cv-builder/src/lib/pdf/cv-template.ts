import type { CVContent, CVDocument, UserProfile, DisplaySettings } from '@/types/cv.types';

export interface CVTemplateData {
  cv: CVDocument;
  userProfile?: UserProfile;
}

/**
 * Generate HTML for CV PDF export
 */
export function generateCVHTML(data: CVTemplateData): string {
  const { cv, userProfile } = data;
  const content = cv.content;
  const defaultSettings: DisplaySettings = {
    theme: 'light',
    showPhoto: true,
    showExperience: true,
    showAttachments: false,
    privacyLevel: 'personal',
  };
  const settings: DisplaySettings = { ...defaultSettings, ...cv.display_settings };

  const styles = generateStyles(settings);
  const headerHTML = generateHeader(content, userProfile, settings);
  const profileHTML = generateProfile(content);
  const keyCompetencesHTML = generateKeyCompetences(content);
  const experienceHTML = generateExperience(content);
  const educationHTML = generateEducation(content);
  const skillsHTML = generateSkills(content);

  return `
<!DOCTYPE html>
<html lang="${cv.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cv.name}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="cv-container">
    ${headerHTML}
    ${profileHTML}
    ${keyCompetencesHTML}
    ${experienceHTML}
    ${educationHTML}
    ${skillsHTML}
  </div>
</body>
</html>
  `.trim();
}

function generateStyles(settings: DisplaySettings): string {
  const accentColor = settings.accentColor || '#2563eb';
  const fontFamily = settings.fontFamily || "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${fontFamily};
      font-size: 10pt;
      line-height: 1.5;
      color: #1f2937;
      background: white;
    }

    .cv-container {
      max-width: 100%;
      padding: 0;
    }

    /* Header */
    .header {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid ${accentColor};
    }

    .header-name {
      font-size: 24pt;
      font-weight: 700;
      color: #111827;
      margin-bottom: 4px;
    }

    .header-tagline {
      font-size: 11pt;
      color: ${accentColor};
      font-weight: 500;
      margin-bottom: 8px;
    }

    .header-contact {
      font-size: 9pt;
      color: #6b7280;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .header-contact span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    /* Section */
    .section {
      margin-bottom: 18px;
    }

    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: ${accentColor};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e7eb;
    }

    /* Profile */
    .profile-text {
      font-size: 10pt;
      color: #374151;
      text-align: justify;
    }

    /* Key Competences */
    .competences-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .competence-item {
      padding: 8px;
      background: #f9fafb;
      border-radius: 4px;
    }

    .competence-title {
      font-weight: 600;
      color: #111827;
      margin-bottom: 2px;
    }

    .competence-description {
      font-size: 9pt;
      color: #6b7280;
    }

    /* Experience */
    .experience-item {
      margin-bottom: 14px;
      page-break-inside: avoid;
    }

    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }

    .experience-title {
      font-weight: 600;
      color: #111827;
    }

    .experience-company {
      color: #374151;
    }

    .experience-date {
      font-size: 9pt;
      color: #6b7280;
      white-space: nowrap;
    }

    .experience-bullets {
      list-style: disc;
      margin-left: 18px;
      margin-top: 6px;
    }

    .experience-bullets li {
      margin-bottom: 3px;
      color: #374151;
    }

    /* Education */
    .education-item {
      margin-bottom: 10px;
      page-break-inside: avoid;
    }

    .education-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .education-degree {
      font-weight: 600;
      color: #111827;
    }

    .education-institution {
      color: #374151;
    }

    .education-date {
      font-size: 9pt;
      color: #6b7280;
    }

    /* Skills */
    .skills-category {
      margin-bottom: 8px;
    }

    .skills-category-name {
      font-weight: 600;
      color: #111827;
      display: inline;
    }

    .skills-list {
      display: inline;
      color: #374151;
    }

    /* Print styles */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .section {
        page-break-inside: avoid;
      }
    }
  `;
}

function generateHeader(
  content: CVContent,
  userProfile?: UserProfile,
  settings?: DisplaySettings
): string {
  const name = userProfile
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
    : 'Your Name';

  const contactItems: string[] = [];

  if (userProfile?.email) {
    contactItems.push(`<span>${userProfile.email}</span>`);
  }
  if (userProfile?.phone) {
    contactItems.push(`<span>${userProfile.phone}</span>`);
  }
  if (userProfile?.location) {
    contactItems.push(`<span>${userProfile.location}</span>`);
  }
  if (userProfile?.linkedin_url) {
    contactItems.push(`<span>LinkedIn</span>`);
  }
  if (userProfile?.github_url) {
    contactItems.push(`<span>GitHub</span>`);
  }

  return `
    <header class="header">
      <h1 class="header-name">${name}</h1>
      ${content.tagline ? `<p class="header-tagline">${content.tagline}</p>` : ''}
      ${contactItems.length > 0 ? `<div class="header-contact">${contactItems.join('')}</div>` : ''}
    </header>
  `;
}

function generateProfile(content: CVContent): string {
  if (!content.profile) return '';

  return `
    <section class="section">
      <h2 class="section-title">Profile</h2>
      <p class="profile-text">${content.profile}</p>
    </section>
  `;
}

function generateKeyCompetences(content: CVContent): string {
  if (!content.keyCompetences || content.keyCompetences.length === 0) return '';

  const competencesHTML = content.keyCompetences
    .map(
      (comp) => `
      <div class="competence-item">
        <div class="competence-title">${comp.title}</div>
        <div class="competence-description">${comp.description}</div>
      </div>
    `
    )
    .join('');

  return `
    <section class="section">
      <h2 class="section-title">Key Competences</h2>
      <div class="competences-grid">
        ${competencesHTML}
      </div>
    </section>
  `;
}

function generateExperience(content: CVContent): string {
  if (!content.workExperience || content.workExperience.length === 0) return '';

  const experienceHTML = content.workExperience
    .map((exp) => {
      const dateRange = exp.current
        ? `${formatDate(exp.startDate)} - Present`
        : `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`;

      const bulletsHTML =
        exp.bullets && exp.bullets.length > 0
          ? `<ul class="experience-bullets">${exp.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`
          : '';

      return `
        <div class="experience-item">
          <div class="experience-header">
            <div>
              <div class="experience-title">${exp.title}</div>
              <div class="experience-company">${exp.company}${exp.location ? `, ${exp.location}` : ''}</div>
            </div>
            <div class="experience-date">${dateRange}</div>
          </div>
          ${bulletsHTML}
        </div>
      `;
    })
    .join('');

  return `
    <section class="section">
      <h2 class="section-title">Work Experience</h2>
      ${experienceHTML}
    </section>
  `;
}

function generateEducation(content: CVContent): string {
  if (!content.education || content.education.length === 0) return '';

  const educationHTML = content.education
    .map((edu) => {
      const dateRange = edu.endDate ? formatDate(edu.endDate) : 'Present';

      return `
        <div class="education-item">
          <div class="education-header">
            <div>
              <div class="education-degree">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
              <div class="education-institution">${edu.institution}</div>
            </div>
            <div class="education-date">${dateRange}</div>
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <section class="section">
      <h2 class="section-title">Education</h2>
      ${educationHTML}
    </section>
  `;
}

function generateSkills(content: CVContent): string {
  if (!content.skills || content.skills.length === 0) return '';

  const skillsHTML = content.skills
    .map(
      (cat) => `
      <div class="skills-category">
        <span class="skills-category-name">${cat.category}:</span>
        <span class="skills-list">${cat.skills.join(', ')}</span>
      </div>
    `
    )
    .join('');

  return `
    <section class="section">
      <h2 class="section-title">Skills</h2>
      ${skillsHTML}
    </section>
  `;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';

  try {
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
