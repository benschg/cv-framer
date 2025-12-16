/**
 * Legal and Privacy Policy Configuration
 *
 * This file contains configuration for the privacy policy and other legal documents.
 * Replace placeholders with actual company information before deploying to production.
 */

export const LEGAL_CONFIG = {
  // Company Information
  companyName: 'CV Builder',
  companyAddress: 'To be determined',
  companyCity: 'Zurich',
  companyCountry: 'Switzerland',

  // Contact Information
  privacyEmail: 'privacy@cv-builder.com',
  supportEmail: 'support@cv-builder.com',

  // Infrastructure
  dataLocation: 'European Union',
  supabaseRegion: 'EU (Europe)',

  // Policy Metadata
  privacyPolicy: {
    version: '1.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
  },

  termsOfService: {
    version: '1.0',
    lastUpdated: '2025-01-16',
    effectiveDate: '2025-01-16',
  },

  // Data Retention Periods
  dataRetention: {
    analyticsMonths: 12,
    backupDeletionDays: 30,
    inactiveAccountMonths: 24,
  },

  // Age Restrictions
  minimumAge: 16, // Set to 16 or 18 based on your requirements

  // Third-Party Services
  thirdPartyServices: {
    supabase: {
      name: 'Supabase Inc.',
      purpose: 'Database, Authentication, and File Storage',
      privacyPolicy: 'https://supabase.com/privacy',
    },
    googleGemini: {
      name: 'Google LLC',
      purpose: 'AI Content Generation and Document Analysis',
      models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
      privacyPolicy: 'https://policies.google.com/privacy',
      termsOfService: 'https://ai.google.dev/terms',
    },
    googleOAuth: {
      name: 'Google LLC',
      purpose: 'Authentication (Optional)',
      privacyPolicy: 'https://policies.google.com/privacy',
    },
  },
} as const;

/**
 * Helper function to get formatted company address
 */
export function getCompanyAddress(): string {
  return `${LEGAL_CONFIG.companyName}\n${LEGAL_CONFIG.companyAddress}\n${LEGAL_CONFIG.companyCity}\n${LEGAL_CONFIG.companyCountry}`;
}

/**
 * Helper function to check if all placeholders have been replaced
 */
export function hasPlaceholders(): boolean {
  const values = [
    LEGAL_CONFIG.companyName,
    LEGAL_CONFIG.companyAddress,
    LEGAL_CONFIG.privacyEmail,
    LEGAL_CONFIG.dataLocation,
  ];

  return values.some(value => value.includes('[') && value.includes(']'));
}
