import type { CategoryKey, CategoryDefinition, RowNumber } from '@/types/werbeflaechen.types';

// Category metadata configuration - based on Kanton Zurich Werbeflaechen method
export const CATEGORY_DEFINITIONS: Record<CategoryKey, CategoryDefinition> = {
  // Row 1: "Will you love the job?" (Yellow/Orange tones)
  vision_mission: {
    key: 'vision_mission',
    row: 1,
    order: 1,
    color: '#fbbf24',
    icon: 'Target',
    beginner: true,
    en: 'Vision & Mission',
    de: 'Vision & Mission',
    description_en: 'Your professional vision and mission - where you want to go and what drives you',
    description_de: 'Ihre berufliche Vision und Mission - wohin Sie wollen und was Sie antreibt',
  },
  motivation: {
    key: 'motivation',
    row: 1,
    order: 2,
    color: '#f59e0b',
    icon: 'Flame',
    beginner: true,
    en: 'Motivation',
    de: 'Motivation',
    description_en: 'What motivates you in your work and career',
    description_de: 'Was Sie in Ihrer Arbeit und Karriere motiviert',
  },
  passion: {
    key: 'passion',
    row: 1,
    order: 3,
    color: '#f97316',
    icon: 'Heart',
    beginner: false,
    en: 'Passion',
    de: 'Leidenschaft',
    description_en: 'Your professional passions and what excites you about your work',
    description_de: 'Ihre beruflichen Leidenschaften und was Sie an Ihrer Arbeit begeistert',
  },
  slogan: {
    key: 'slogan',
    row: 1,
    order: 4,
    color: '#ea580c',
    icon: 'MessageSquare',
    beginner: false,
    en: 'Slogan',
    de: 'Slogan',
    description_en: 'Your personal professional slogan or tagline',
    description_de: 'Ihr persönlicher beruflicher Slogan oder Leitsatz',
  },
  zitat_motto: {
    key: 'zitat_motto',
    row: 1,
    order: 5,
    color: '#dc2626',
    icon: 'Quote',
    beginner: false,
    en: 'Quote/Motto',
    de: 'Zitat/Motto',
    description_en: 'A quote or motto that represents your professional philosophy',
    description_de: 'Ein Zitat oder Motto, das Ihre berufliche Philosophie widerspiegelt',
  },
  highlights: {
    key: 'highlights',
    row: 1,
    order: 6,
    color: '#b91c1c',
    icon: 'Star',
    beginner: true,
    en: 'Highlights',
    de: 'Highlights',
    description_en: 'Key highlights and standout moments from your career',
    description_de: 'Wichtige Highlights und herausragende Momente Ihrer Karriere',
  },

  // Row 2: "Can you do the job?" (Pink/Purple tones)
  erfolge: {
    key: 'erfolge',
    row: 2,
    order: 1,
    color: '#ec4899',
    icon: 'Trophy',
    beginner: true,
    en: 'Achievements',
    de: 'Erfolge',
    description_en: 'Your key achievements and accomplishments',
    description_de: 'Ihre wichtigsten Erfolge und Errungenschaften',
  },
  mehrwert: {
    key: 'mehrwert',
    row: 2,
    order: 2,
    color: '#d946ef',
    icon: 'TrendingUp',
    beginner: false,
    en: 'Added Value',
    de: 'Mehrwert',
    description_en: 'The unique value you bring to employers',
    description_de: 'Der einzigartige Wert, den Sie Arbeitgebern bieten',
  },
  projekte: {
    key: 'projekte',
    row: 2,
    order: 3,
    color: '#a855f7',
    icon: 'Folder',
    beginner: true,
    en: 'Projects',
    de: 'Projekte',
    description_en: 'Key projects you have worked on',
    description_de: 'Wichtige Projekte, an denen Sie gearbeitet haben',
  },
  referenzen: {
    key: 'referenzen',
    row: 2,
    order: 4,
    color: '#8b5cf6',
    icon: 'Users',
    beginner: false,
    en: 'References',
    de: 'Referenzen',
    description_en: 'Professional references and testimonials',
    description_de: 'Berufliche Referenzen und Empfehlungen',
  },
  usp: {
    key: 'usp',
    row: 2,
    order: 5,
    color: '#7c3aed',
    icon: 'Sparkles',
    beginner: true,
    en: 'Unique Selling Point',
    de: 'USP',
    description_en: 'What makes you uniquely valuable as a professional',
    description_de: 'Was Sie als Fachkraft einzigartig wertvoll macht',
  },
  corporate_design: {
    key: 'corporate_design',
    row: 2,
    order: 6,
    color: '#6d28d9',
    icon: 'Palette',
    beginner: false,
    en: 'Personal Branding',
    de: 'Corporate Design',
    description_en: 'Your personal brand and professional image',
    description_de: 'Ihre persönliche Marke und Ihr berufliches Image',
  },

  // Row 3: "Can we work together?" (Green/Teal tones)
  erfahrungswissen: {
    key: 'erfahrungswissen',
    row: 3,
    order: 1,
    color: '#22c55e',
    icon: 'Brain',
    beginner: false,
    en: 'Experiential Knowledge',
    de: 'Erfahrungswissen',
    description_en: 'Knowledge gained through experience that sets you apart',
    description_de: 'Durch Erfahrung erworbenes Wissen, das Sie auszeichnet',
  },
  kernkompetenzen: {
    key: 'kernkompetenzen',
    row: 3,
    order: 2,
    color: '#16a34a',
    icon: 'Wrench',
    beginner: true,
    en: 'Core Competencies',
    de: 'Kernkompetenzen',
    description_en: 'Your core technical and hard skills',
    description_de: 'Ihre technischen Kernkompetenzen und Fachkenntnisse',
  },
  schluesselkompetenzen: {
    key: 'schluesselkompetenzen',
    row: 3,
    order: 3,
    color: '#15803d',
    icon: 'Key',
    beginner: true,
    en: 'Key Competencies',
    de: 'Schlüsselkompetenzen',
    description_en: 'Your key soft skills and interpersonal competencies',
    description_de: 'Ihre wichtigsten Soft Skills und zwischenmenschlichen Kompetenzen',
  },
  kurzprofil: {
    key: 'kurzprofil',
    row: 3,
    order: 4,
    color: '#14532d',
    icon: 'User',
    beginner: true,
    en: 'Short Profile',
    de: 'Kurzprofil',
    description_en: 'A concise professional summary',
    description_de: 'Eine prägnante berufliche Zusammenfassung',
  },
  berufliche_erfahrungen: {
    key: 'berufliche_erfahrungen',
    row: 3,
    order: 5,
    color: '#0d9488',
    icon: 'Briefcase',
    beginner: true,
    en: 'Professional Experience',
    de: 'Berufliche Erfahrungen',
    description_en: 'Your work history and professional experience',
    description_de: 'Ihr Werdegang und Ihre berufliche Erfahrung',
  },
  aus_weiterbildungen: {
    key: 'aus_weiterbildungen',
    row: 3,
    order: 6,
    color: '#0891b2',
    icon: 'GraduationCap',
    beginner: true,
    en: 'Education & Training',
    de: 'Aus- & Weiterbildungen',
    description_en: 'Your education, certifications, and training',
    description_de: 'Ihre Ausbildung, Zertifizierungen und Weiterbildungen',
  },
} as const;

// Helper functions
export const getAllCategories = (): CategoryDefinition[] => {
  return Object.values(CATEGORY_DEFINITIONS).sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.order - b.order;
  });
};

export const getCategoriesByRow = (row: RowNumber): CategoryDefinition[] => {
  return getAllCategories().filter((cat) => cat.row === row);
};

export const getBeginnerCategories = (): CategoryDefinition[] => {
  return getAllCategories().filter((cat) => cat.beginner);
};

export const getCategoryByKey = (key: CategoryKey): CategoryDefinition => {
  return CATEGORY_DEFINITIONS[key];
};

// Row titles and descriptions
export const ROW_METADATA: Record<RowNumber, { en: string; de: string }> = {
  1: {
    en: 'Will you love the job?',
    de: 'Werden Sie den Job lieben?',
  },
  2: {
    en: 'Can you do the job?',
    de: 'Können Sie den Job machen?',
  },
  3: {
    en: 'Can we work together?',
    de: 'Können wir zusammenarbeiten?',
  },
};

// Beginner mode categories
export const BEGINNER_CATEGORIES: CategoryKey[] = [
  'vision_mission',
  'motivation',
  'highlights',
  'erfolge',
  'projekte',
  'usp',
  'kernkompetenzen',
  'schluesselkompetenzen',
  'kurzprofil',
  'berufliche_erfahrungen',
  'aus_weiterbildungen',
];
