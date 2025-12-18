import type { CVMainSection, CVSidebarSection } from '@/types/cv-layout.types';

/** Labels for CV main sections in both English and German */
export const CV_SECTION_LABELS: Record<CVMainSection, { en: string; de: string }> = {
  header: { en: 'Header', de: 'Kopfzeile' },
  profile: { en: 'Profile', de: 'Profil' },
  experience: { en: 'Work Experience', de: 'Berufserfahrung' },
  education: { en: 'Education', de: 'Ausbildung' },
  skills: { en: 'Skills', de: 'Fähigkeiten' },
  keyCompetences: { en: 'Key Competences', de: 'Kernkompetenzen' },
  projects: { en: 'Projects', de: 'Projekte' },
  references: { en: 'References', de: 'Referenzen' },
};

/** Labels for CV sidebar sections in both English and German */
export const CV_SIDEBAR_LABELS: Record<CVSidebarSection, { en: string; de: string }> = {
  photo: { en: 'Photo', de: 'Foto' },
  contact: { en: 'Contact', de: 'Kontakt' },
  skills: { en: 'Skills', de: 'Fähigkeiten' },
  languages: { en: 'Languages', de: 'Sprachen' },
  education: { en: 'Education', de: 'Ausbildung' },
  certifications: { en: 'Certifications', de: 'Zertifikate' },
};

/** Get section label by type and language */
export function getSectionLabel(
  sectionType: CVMainSection,
  language: 'en' | 'de' = 'en'
): string {
  return CV_SECTION_LABELS[sectionType]?.[language] || sectionType;
}

/** Get sidebar section label by type and language */
export function getSidebarLabel(
  sectionType: CVSidebarSection,
  language: 'en' | 'de' = 'en'
): string {
  return CV_SIDEBAR_LABELS[sectionType]?.[language] || sectionType;
}
