# CV Builder - Claude Code Guide

## Project Overview

A Next.js 15 application for creating professional CVs and cover letters using AI, built with the "Werbeflaechen" (advertising spaces) methodology - an 18-category self-marketing framework.

## Tech Stack

- **Runtime**: Bun (use `bun` instead of `npm` for all commands)
- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth (Google OAuth + email/password)
- **AI**: Google Gemini (via @google/generative-ai)
- **UI**: ShadCN UI + Tailwind CSS
- **Language**: TypeScript (strict mode)

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server
bun run build        # Production build
bun run lint         # Run ESLint
```

## Project Structure

```
cv-builder/
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Protected routes with sidebar
│   │   │   ├── werbeflaechen/ # Core content entry
│   │   │   ├── cv/            # CV generation
│   │   │   ├── cover-letter/  # Cover letter generation
│   │   │   ├── applications/  # Job application tracker
│   │   │   ├── profile/       # User profile
│   │   │   └── settings/      # App settings
│   │   ├── api/               # API routes
│   │   ├── auth/              # Auth pages (login, signup, callback)
│   │   └── s/[token]/         # Public share links
│   ├── components/
│   │   ├── ui/                # ShadCN components
│   │   └── werbeflaechen/     # Domain-specific components
│   ├── data/                  # Static config (categories, metadata)
│   ├── lib/                   # Utilities (supabase client, utils)
│   ├── services/              # API service functions
│   └── types/                 # TypeScript types
├── supabase/
│   └── migrations/            # Database migrations
└── public/
```

## Key Concepts

### Werbeflaechen (18 Categories)

The core content model with 18 self-marketing categories:
- kurzprofil, berufliche_erfahrungen, aus_weiterbildungen
- kernkompetenzen, branchenexpertise, sprachkenntnisse
- soft_skills, technische_faehigkeiten, methodenkompetenzen
- fuehrungskompetenzen, projekterfahrungen, erfolge_referenzen
- zertifizierungen, publikationen, ehrenamtliche_taetigkeiten
- interessen_hobbys, ziele_motivation, unique_value_proposition

### Beginner Mode

Shows 11 essential categories for new users, hiding advanced ones.

### Multi-language

All content supports both English (en) and German (de).

## Database Schema

### Core Tables (all with RLS policies)

**User & Content:**
- `user_profiles` - User settings and preferences
- `werbeflaechen_entries` - Content for each category
- `uploaded_cvs` - Uploaded CV files for autofill

**Profile Career Data (Master Data):**
- `profile_work_experiences` - Work history with auto-save
- `profile_educations` - Educational background
- `profile_skill_categories` - Organized skills
- `profile_certifications` - Certifications with document upload
- `profile_references` - Professional references with letters

**Documents:**
- `cv_documents` - Generated CV documents
- `cover_letters` - Generated cover letters
- `job_applications` - Application tracker entries
- `share_links` - Public sharing tokens

**Storage Buckets:**
- `certification-documents` - Certification files
- `reference-letters` - Reference letter PDFs

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```

## AI Features

- **CV Generation**: Creates tailored CVs from Werbeflaechen content
- **Cover Letter Generation**: Job-specific cover letters
- **CV Autofill**: Extract Werbeflaechen from uploaded PDF/DOCX/TXT CVs
- **Content Regeneration**: AI-powered item regeneration

## Type System & Database Types

### Auto-Generated Types from Supabase

**ALWAYS use auto-generated types from Supabase schema for database operations.**

1. **Type Generation Command**:
   ```bash
   npx supabase gen types typescript --project-id zmfgbwluvrgeojovntkd > src/types/database.types.ts
   ```
   Run this after any database migration to keep types in sync.

2. **Type Location**:
   - `src/types/database.types.ts` - Auto-generated from Supabase (DO NOT edit manually)
   - `src/types/profile-career.types.ts` - Helper types for profile career data

3. **Usage Pattern**:
   ```typescript
   import type {
     ProfileWorkExperience,
     ProfileEducation
   } from '@/types/profile-career.types';

   // Types are automatically in sync with database schema
   const experience: ProfileWorkExperience = {
     id: '...',
     user_id: '...',
     company: 'Acme Inc',
     title: 'Senior Developer',
     // ... TypeScript will enforce all required fields
   };
   ```

4. **Benefits**:
   - ✅ Compile-time type safety
   - ✅ Auto-complete in IDE
   - ✅ Catches schema mismatches before runtime
   - ✅ No manual type maintenance

### Data Access Layer

All database operations use generic helper functions in `src/services/profile-career.service.ts`:

**Helper Functions:**
- `getCurrentUserId()` - Get authenticated user ID
- `fetchProfileData<T>()` - Generic fetch with ordering
- `createProfileData<T>()` - Generic create with auto user_id injection
- `updateProfileData<T>()` - Generic update
- `deleteProfileData()` - Generic delete
- `createAutoSave<T>()` - Auto-save factory with 1-second debouncing

**Example Service Function:**
```typescript
export async function fetchWorkExperiences() {
  return fetchProfileData<ProfileWorkExperience>('profile_work_experiences', [
    { column: 'display_order', ascending: true },
    { column: 'start_date', ascending: false },
  ]);
}
```

## Supabase Commands

```bash
# Push migrations to remote
npx supabase db push

# Reset local database (if running locally)
npx supabase db reset

# Generate TypeScript types from schema
npx supabase gen types typescript --project-id zmfgbwluvrgeojovntkd > src/types/database.types.ts
```

## Implementation Phases (Completed)

1. ✅ Phase 1: Auth & User Profile
2. ✅ Phase 2: Werbeflaechen Data Entry
3. ✅ Phase 3: CV Templates & Generation
4. ✅ Phase 4: CV Export (PDF/DOCX)
5. ✅ Phase 5: Sharing & Public Links
6. ✅ Phase 6: Cover Letter Generation
7. ✅ Phase 7: Application Tracker
8. ✅ Phase 8: Polish (toasts, error handling)
9. ✅ CV Autofill from uploaded files

## API Type Safety Rules

**All API endpoints MUST use Zod schemas for type safety:**

1. **Schema Location**: All schemas live in `src/types/api.schemas.ts`
2. **Request Validation**: Every API route must validate request body/params with Zod
3. **Response Types**: Use `z.infer<typeof Schema>` for response types
4. **Shared Types**: Frontend imports types from schemas, not separate type files
5. **Pattern**:
   ```typescript
   // In API route:
   import { CreateCVSchema, type CreateCVInput } from '@/types/api.schemas';

   const body = await request.json();
   const validated = CreateCVSchema.parse(body); // Throws on invalid
   ```

6. **Naming Convention**:
   - Request schemas: `{Action}{Resource}Schema` (e.g., `CreateCVSchema`)
   - Response schemas: `{Resource}ResponseSchema` (e.g., `CVResponseSchema`)
   - Inferred types: `{Action}{Resource}Input` / `{Resource}Response`

## Internationalization (i18n)

**All user-facing strings MUST use the i18n system:**

1. **Translation Files**: `src/i18n/en.json` and `src/i18n/de.json`
2. **Hook Usage**:
   ```typescript
   import { useTranslations } from '@/hooks/use-translations';

   const { t, translations } = useTranslations(language);

   // Dot notation for simple strings
   {t('common.back')}
   {t('werbeflaechen.title')}

   // Direct access for nested objects
   {translations.werbeflaechen.categories.kurzprofil.title}
   ```

3. **Adding New Strings**:
   - Add to BOTH `en.json` and `de.json`
   - Use consistent key structure: `section.subsection.key`
   - Never use inline ternaries like `language === 'de' ? 'German' : 'English'`

4. **Key Structure**:
   - `common.*` - Shared UI strings (back, save, cancel, etc.)
   - `nav.*` - Navigation labels
   - `werbeflaechen.*` - Werbeflaechen feature
   - `cv.*` - CV builder feature
   - `coverLetter.*` - Cover letter feature
   - `applications.*` - Application tracker
   - `settings.*` - Settings page
   - `auth.*` - Authentication pages

## Notes

- PDF extraction uses `unpdf` (serverless-compatible)
- DOCX extraction uses `mammoth`
- Always use Row Level Security (RLS) for new tables
- Toast notifications via `sonner`
- Error boundaries for graceful error handling
