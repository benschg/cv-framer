import type { CVContent, CVDocument, UserProfile, DisplaySettings } from '@/types/cv.types';

export interface CVTemplateData {
  cv: CVDocument;
  userProfile?: UserProfile;
  photoUrl?: string | null;
}

/**
 * Generate HTML for CV PDF export
 */
export function generateCVHTML(data: CVTemplateData): string {
  const { cv, userProfile, photoUrl } = data;
  const content = cv.content;
  const defaultSettings: DisplaySettings = {
    theme: 'light',
    format: 'A4',
    showPhoto: true,
    showAttachments: false,
    privacyLevel: 'personal',
  };
  const settings: DisplaySettings = { ...defaultSettings, ...cv.display_settings };

  const styles = generateStyles(settings);
  const headerHTML = generateHeader(content, userProfile, settings, photoUrl);
  const profileHTML = generateProfile(content);
  const keyCompetencesHTML = generateKeyCompetences(content);

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

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
    }

    .header-text {
      flex: 1;
    }

    .header-photo {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
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
  settings?: DisplaySettings,
  photoUrl?: string | null
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

  const showPhoto = settings?.showPhoto !== false && photoUrl;
  const photoHTML = showPhoto
    ? `<img src="${photoUrl}" alt="${name}" class="header-photo" />`
    : '';

  return `
    <header class="header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="header-name">${name}</h1>
          ${content.tagline ? `<p class="header-tagline">${content.tagline}</p>` : ''}
          ${contactItems.length > 0 ? `<div class="header-contact">${contactItems.join('')}</div>` : ''}
        </div>
        ${photoHTML}
      </div>
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
