import { z } from 'zod';

// ============================================
// COMMON SCHEMAS
// ============================================

export const LanguageSchema = z.enum(['en', 'de']).default('en');

export const ApplicationStatusSchema = z.enum([
  'draft',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'accepted',
  'withdrawn',
]);

export const PrivacyLevelSchema = z.enum(['none', 'personal', 'full']).default('personal');

// Generic success response
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

// Generic error response
export const ErrorResponseSchema = z.object({
  error: z.string(),
});

// Job context for CV/Cover Letter generation
export const JobContextSchema = z.object({
  company: z.string().optional(),
  position: z.string().optional(),
  jobPosting: z.string().optional(),
  jobPostingUrl: z.string().optional(),
});

// ============================================
// WERBEFLAECHEN SCHEMAS
// ============================================

export const WerbeflaechenCategorySchema = z.enum([
  'vision_mission',
  'motivation',
  'passion',
  'slogan',
  'zitat_motto',
  'highlights',
  'erfolge',
  'mehrwert',
  'projekte',
  'referenzen',
  'usp',
  'corporate_design',
  'erfahrungswissen',
  'kernkompetenzen',
  'schluesselkompetenzen',
  'kurzprofil',
  'berufliche_erfahrungen',
  'aus_weiterbildungen',
]);

export const WerbeflaechenEntrySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  category_key: WerbeflaechenCategorySchema,
  language: LanguageSchema,
  content: z.record(z.string(), z.unknown()).default({}),
  is_complete: z.boolean().default(false),
  row_number: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// GET /api/werbeflaechen
export const GetWerbeflaechenQuerySchema = z.object({
  language: LanguageSchema.optional(),
});

export const GetWerbeflaechenResponseSchema = z.object({
  entries: z.array(WerbeflaechenEntrySchema),
});

// POST /api/werbeflaechen
export const CreateWerbeflaechenSchema = z.object({
  category_key: WerbeflaechenCategorySchema,
  language: LanguageSchema.optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  is_complete: z.boolean().default(false),
  row_number: z.number().optional(),
});

export const CreateWerbeflaechenResponseSchema = z.object({
  entry: WerbeflaechenEntrySchema,
});

// PUT /api/werbeflaechen/[category]
export const UpdateWerbeflaechenSchema = z.object({
  language: LanguageSchema.optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  is_complete: z.boolean().optional(),
  row_number: z.number().optional(),
});

// POST /api/werbeflaechen/autofill
export const AutofillWerbeflaechenSchema = z.object({
  cvText: z.string().min(50, 'CV text must be at least 50 characters'),
  language: LanguageSchema.optional(),
  model: z.string().default('gemini-2.0-flash'),
  overwrite: z.boolean().default(false),
});

export const AutofillWerbeflaechenResponseSchema = z.object({
  success: z.boolean(),
  savedCategories: z.array(z.string()),
  extractedData: z.record(z.string(), z.unknown()),
  message: z.string(),
});

// ============================================
// CV SCHEMAS
// ============================================

export const DisplaySettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).default('light'),
  showPhoto: z.boolean().default(true),
  showExperience: z.boolean().default(true),
  showAttachments: z.boolean().default(false),
  privacyLevel: PrivacyLevelSchema,
  accentColor: z.string().optional(),
  fontFamily: z.string().optional(),
}).partial();

export const CVDocumentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  language: LanguageSchema,
  template_id: z.string().uuid().nullable(),
  content: z.record(z.string(), z.unknown()),
  job_context: JobContextSchema.nullable(),
  display_settings: DisplaySettingsSchema.nullable(),
  is_default: z.boolean(),
  is_archived: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

// GET /api/cv
export const GetCVsResponseSchema = z.object({
  cvs: z.array(CVDocumentSchema),
});

// POST /api/cv
export const CreateCVSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  language: LanguageSchema.optional(),
  template_id: z.string().uuid().optional(),
  content: z.record(z.string(), z.unknown()).default({}),
  job_context: JobContextSchema.optional(),
  display_settings: DisplaySettingsSchema.optional(),
});

export const CVResponseSchema = z.object({
  cv: CVDocumentSchema,
});

// PUT /api/cv/[id]
export const UpdateCVSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  job_context: JobContextSchema.optional(),
  display_settings: z.record(z.string(), z.unknown()).optional(),
  is_default: z.boolean().optional(),
  is_archived: z.boolean().optional(),
});

// GET /api/cv/[id]/export
export const ExportCVQuerySchema = z.object({
  format: z.enum(['A4', 'Letter']).default('A4'),
});

// ============================================
// CV GENERATION SCHEMAS
// ============================================

// POST /api/generate-cv
export const GenerateCVSchema = z.object({
  cv_id: z.string().uuid().optional(),
  language: LanguageSchema.optional(),
  sections: z.array(z.string()).optional(),
  job_context: JobContextSchema.optional(),
  analyze_job_posting: z.boolean().default(true),
});

export const AIMetadataSchema = z.object({
  model: z.string(),
  promptVersion: z.string().optional(),
  generatedAt: z.string(),
  regeneratedAt: z.string().optional(),
});

export const GenerateCVResponseSchema = z.object({
  content: z.record(z.string(), z.unknown()),
  companyResearch: z.record(z.string(), z.unknown()).optional(),
  ai_metadata: AIMetadataSchema,
});

// POST /api/regenerate-item
export const RegenerateItemSchema = z.object({
  cv_id: z.string().uuid().optional(),
  section: z.string().min(1, 'Section is required'),
  current_content: z.string().optional(),
  custom_instructions: z.string().optional(),
  language: LanguageSchema.optional(),
  experience_context: z.object({
    company: z.string(),
    title: z.string(),
    description: z.string().optional(),
  }).optional(),
});

export const RegenerateItemResponseSchema = z.object({
  section: z.string(),
  content: z.union([z.string(), z.array(z.string())]),
  ai_metadata: AIMetadataSchema,
});

// ============================================
// SHARE LINK SCHEMAS
// ============================================

export const ShareLinkSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  cv_id: z.string().uuid(),
  token: z.string(),
  privacy_level: PrivacyLevelSchema,
  expires_at: z.string().nullable(),
  password_hash: z.string().nullable(),
  is_active: z.boolean(),
  view_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

// GET /api/share
export const GetShareLinksQuerySchema = z.object({
  cv_id: z.string().uuid(),
});

export const GetShareLinksResponseSchema = z.object({
  shareLinks: z.array(ShareLinkSchema),
});

// POST /api/share
export const CreateShareLinkSchema = z.object({
  cv_id: z.string().uuid(),
  privacy_level: PrivacyLevelSchema.optional(),
  expires_at: z.string().optional(),
  password: z.string().optional(),
});

export const ShareLinkResponseSchema = z.object({
  shareLink: ShareLinkSchema,
});

// PATCH /api/share/[id]
export const UpdateShareLinkSchema = z.object({
  is_active: z.boolean().optional(),
  privacy_level: PrivacyLevelSchema.optional(),
  expires_at: z.string().optional(),
});

// GET /api/public/cv/[token]
export const PublicCVResponseSchema = z.object({
  cv: CVDocumentSchema,
  userProfile: z.record(z.string(), z.unknown()).nullable(),
  shareLink: z.object({
    id: z.string().uuid(),
    privacy_level: PrivacyLevelSchema,
    created_at: z.string(),
  }),
});

// ============================================
// COVER LETTER SCHEMAS
// ============================================

export const CoverLetterSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  language: LanguageSchema,
  cv_id: z.string().uuid().nullable(),
  content: z.record(z.string(), z.unknown()),
  job_context: JobContextSchema.nullable(),
  ai_metadata: AIMetadataSchema.nullable().optional(),
  is_archived: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

// GET /api/cover-letter
export const GetCoverLettersResponseSchema = z.object({
  coverLetters: z.array(CoverLetterSchema),
});

// POST /api/cover-letter
export const CreateCoverLetterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  language: LanguageSchema.optional(),
  cv_id: z.string().uuid().optional(),
  content: z.record(z.string(), z.unknown()).default({}),
  job_context: JobContextSchema.optional(),
});

export const CoverLetterResponseSchema = z.object({
  coverLetter: CoverLetterSchema,
});

// PUT /api/cover-letter/[id]
export const UpdateCoverLetterSchema = z.object({
  name: z.string().min(1).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  job_context: JobContextSchema.optional(),
  cv_id: z.string().uuid().nullable().optional(),
  is_archived: z.boolean().optional(),
});

// POST /api/generate-cover-letter
export const GenerateCoverLetterSchema = z.object({
  cover_letter_id: z.string().uuid().optional(),
  cv_id: z.string().uuid().optional(),
  language: LanguageSchema.optional(),
  job_context: JobContextSchema.optional(),
});

export const GenerateCoverLetterResponseSchema = z.object({
  content: z.record(z.string(), z.unknown()),
  companyResearch: z.record(z.string(), z.unknown()).optional(),
  ai_metadata: AIMetadataSchema,
});

// ============================================
// APPLICATION SCHEMAS
// ============================================

export const JobApplicationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  cv_id: z.string().uuid().nullable(),
  cover_letter_id: z.string().uuid().nullable(),
  company_name: z.string(),
  job_title: z.string(),
  job_url: z.string().nullable(),
  job_description: z.string().nullable(),
  location: z.string().nullable(),
  salary_range: z.string().nullable(),
  status: ApplicationStatusSchema,
  applied_at: z.string().nullable(),
  deadline: z.string().nullable(),
  notes: z.string().nullable(),
  contact_name: z.string().nullable(),
  contact_email: z.string().nullable(),
  fit_analysis: z.record(z.string(), z.unknown()).nullable(),
  is_archived: z.boolean(),
  is_favorite: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

// GET /api/applications
export const GetApplicationsQuerySchema = z.object({
  status: ApplicationStatusSchema.optional(),
  includeArchived: z.enum(['true', 'false']).optional(),
});

export const GetApplicationsResponseSchema = z.object({
  applications: z.array(JobApplicationSchema),
});

// POST /api/applications
export const CreateApplicationSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  job_title: z.string().min(1, 'Job title is required'),
  job_url: z.string().url().optional().or(z.literal('')),
  job_description: z.string().optional(),
  location: z.string().optional(),
  salary_range: z.string().optional(),
  status: ApplicationStatusSchema.default('draft'),
  deadline: z.string().optional(),
  notes: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  cv_id: z.string().uuid().optional(),
  cover_letter_id: z.string().uuid().optional(),
});

export const ApplicationResponseSchema = z.object({
  application: JobApplicationSchema,
});

// PUT /api/applications/[id]
export const UpdateApplicationSchema = z.object({
  company_name: z.string().min(1).optional(),
  job_title: z.string().min(1).optional(),
  job_url: z.string().url().optional().or(z.literal('')),
  job_description: z.string().optional(),
  location: z.string().optional(),
  salary_range: z.string().optional(),
  status: ApplicationStatusSchema.optional(),
  applied_at: z.string().optional(),
  deadline: z.string().optional(),
  notes: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  cv_id: z.string().uuid().nullable().optional(),
  cover_letter_id: z.string().uuid().nullable().optional(),
  fit_analysis: z.record(z.string(), z.unknown()).optional(),
  is_archived: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
});

// GET /api/applications/stats
export const ApplicationStatsResponseSchema = z.object({
  stats: z.object({
    total: z.number(),
    byStatus: z.record(ApplicationStatusSchema, z.number()),
    thisWeek: z.number(),
    thisMonth: z.number(),
  }),
});

// ============================================
// JOB FIT ANALYSIS SCHEMAS
// ============================================

export const JobFitAnalysisSchema = z.object({
  id: z.string().uuid(),
  application_id: z.string().uuid(),
  overall_score: z.number().min(0).max(100).nullable(),
  strengths: z.array(z.string()).nullable(),
  gaps: z.array(z.string()).nullable(),
  recommendations: z.array(z.string()).nullable(),
  summary: z.string().nullable(),
  raw_analysis: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// POST /api/applications/[id]/analyze
export const CreateFitAnalysisSchema = z.object({
  overall_score: z.number().min(0).max(100).optional(),
  strengths: z.array(z.string()).optional(),
  gaps: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  summary: z.string().optional(),
  raw_analysis: z.record(z.string(), z.unknown()).optional(),
});

export const FitAnalysisResponseSchema = z.object({
  fitAnalysis: JobFitAnalysisSchema,
});

// ============================================
// CV UPLOAD SCHEMAS
// ============================================

export const UploadedCVSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  file_type: z.enum(['pdf', 'docx', 'txt']),
  file_size: z.number().nullable(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  created_at: z.string(),
  extraction_metadata: z.record(z.string(), z.unknown()),
});

// POST /api/cv-upload (FormData - validated manually)
export const CVUploadResponseSchema = z.object({
  success: z.boolean(),
  uploadId: z.string().uuid().optional(),
  extractedText: z.string(),
  filename: z.string(),
  charCount: z.number(),
});

// GET /api/cv-upload
export const GetUploadedCVsResponseSchema = z.object({
  uploads: z.array(UploadedCVSchema),
});

// GET /api/cv-upload/[id]
export const UploadedCVDetailResponseSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  fileType: z.string(),
  extractedText: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

// ============================================
// INFERRED TYPES
// ============================================

// Common
export type Language = z.infer<typeof LanguageSchema>;
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;
export type PrivacyLevel = z.infer<typeof PrivacyLevelSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Werbeflaechen
export type WerbeflaechenCategory = z.infer<typeof WerbeflaechenCategorySchema>;
export type WerbeflaechenEntry = z.infer<typeof WerbeflaechenEntrySchema>;
export type CreateWerbeflaechenInput = z.infer<typeof CreateWerbeflaechenSchema>;
export type UpdateWerbeflaechenInput = z.infer<typeof UpdateWerbeflaechenSchema>;
export type AutofillWerbeflaechenInput = z.infer<typeof AutofillWerbeflaechenSchema>;
export type AutofillWerbeflaechenResponse = z.infer<typeof AutofillWerbeflaechenResponseSchema>;

// CV
export type CVDocument = z.infer<typeof CVDocumentSchema>;
export type CreateCVInput = z.infer<typeof CreateCVSchema>;
export type UpdateCVInput = z.infer<typeof UpdateCVSchema>;
export type CVResponse = z.infer<typeof CVResponseSchema>;
export type GetCVsResponse = z.infer<typeof GetCVsResponseSchema>;

// CV Generation
export type JobContext = z.infer<typeof JobContextSchema>;
export type GenerateCVInput = z.infer<typeof GenerateCVSchema>;
export type GenerateCVResponse = z.infer<typeof GenerateCVResponseSchema>;
export type RegenerateItemInput = z.infer<typeof RegenerateItemSchema>;
export type RegenerateItemResponse = z.infer<typeof RegenerateItemResponseSchema>;

// Share Links
export type ShareLink = z.infer<typeof ShareLinkSchema>;
export type CreateShareLinkInput = z.infer<typeof CreateShareLinkSchema>;
export type UpdateShareLinkInput = z.infer<typeof UpdateShareLinkSchema>;
export type ShareLinkResponse = z.infer<typeof ShareLinkResponseSchema>;
export type PublicCVResponse = z.infer<typeof PublicCVResponseSchema>;

// Cover Letters
export type CoverLetter = z.infer<typeof CoverLetterSchema>;
export type CreateCoverLetterInput = z.infer<typeof CreateCoverLetterSchema>;
export type UpdateCoverLetterInput = z.infer<typeof UpdateCoverLetterSchema>;
export type CoverLetterResponse = z.infer<typeof CoverLetterResponseSchema>;
export type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterSchema>;
export type GenerateCoverLetterResponse = z.infer<typeof GenerateCoverLetterResponseSchema>;

// Applications
export type JobApplication = z.infer<typeof JobApplicationSchema>;
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof UpdateApplicationSchema>;
export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;
export type ApplicationStatsResponse = z.infer<typeof ApplicationStatsResponseSchema>;

// Job Fit Analysis
export type JobFitAnalysis = z.infer<typeof JobFitAnalysisSchema>;
export type CreateFitAnalysisInput = z.infer<typeof CreateFitAnalysisSchema>;
export type FitAnalysisResponse = z.infer<typeof FitAnalysisResponseSchema>;

// CV Upload
export type UploadedCV = z.infer<typeof UploadedCVSchema>;
export type CVUploadResponse = z.infer<typeof CVUploadResponseSchema>;
export type GetUploadedCVsResponse = z.infer<typeof GetUploadedCVsResponseSchema>;
export type UploadedCVDetailResponse = z.infer<typeof UploadedCVDetailResponseSchema>;
