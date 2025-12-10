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

Key tables (all with RLS policies):
- `user_profiles` - User settings and preferences
- `werbeflaechen_entries` - Content for each category
- `cv_documents` - Generated CV documents
- `cover_letters` - Generated cover letters
- `job_applications` - Application tracker entries
- `uploaded_cvs` - Uploaded CV files for autofill
- `share_links` - Public sharing tokens

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

## Supabase Commands

```bash
npx supabase db push    # Push migrations to remote
npx supabase db reset   # Reset local database
npx supabase gen types  # Generate TypeScript types
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

## Notes

- PDF extraction uses `unpdf` (serverless-compatible)
- DOCX extraction uses `mammoth`
- Always use Row Level Security (RLS) for new tables
- Toast notifications via `sonner`
- Error boundaries for graceful error handling
