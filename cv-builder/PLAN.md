# CV Builder App - Implementation Plan

## Overview

Independent CV builder application combining CV generation and Werbeflaechen (18-category self-marketing framework) into a unified tool for job seekers.

**Key Decisions:**
- Target: Individual job seekers with account login
- Werbeflaechen: Keep all 18 categories + beginner mode
- Data flow: Werbeflaechen feeds CV generation
- PDF: Keep Puppeteer for accurate styling
- UI: ShadCN (replacing MUI) - build from scratch
- Repo: Monorepo alongside existing `nextjs/`

---

## 1. Monorepo Structure

```
benjamin-grauer-personal-webpage/
├── package.json              # Root workspace config
├── turbo.json                # Turborepo config
├── nextjs/                   # Existing personal website (unchanged)
├── cv-builder/               # NEW: Independent CV Builder app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/       # Login, signup, forgot-password
│   │   │   ├── (dashboard)/  # Main app (protected)
│   │   │   │   ├── werbeflaechen/
│   │   │   │   ├── cv/
│   │   │   │   ├── cover-letter/
│   │   │   │   ├── applications/
│   │   │   │   └── settings/
│   │   │   ├── share/[code]/ # Public share links
│   │   │   └── api/
│   │   ├── components/
│   │   │   ├── ui/           # ShadCN base components
│   │   │   ├── cv/           # CV editor, preview, sections
│   │   │   ├── werbeflaechen/# Grid, table, flower views
│   │   │   └── cover-letter/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── types/
│   └── package.json
└── packages/shared/          # Future: extracted shared code
```

---

## 2. Database Schema (New Tables)

```sql
-- User profile (shared across all CVs)
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  photo_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  default_tagline TEXT,
  default_profile TEXT,
  preferred_language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CV templates
CREATE TABLE cv_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  layout_config JSONB NOT NULL DEFAULT '{}',
  style_config JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CV documents with template reference
CREATE TABLE cv_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES cv_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  language VARCHAR(5) DEFAULT 'en',
  content JSONB NOT NULL DEFAULT '{}',
  job_context JSONB,
  ai_metadata JSONB,
  werbeflaechen_snapshot JSONB,
  display_settings JSONB DEFAULT '{"showPhoto": true, "showExperience": true}',
  is_default BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cover letters linked to CV
CREATE TABLE cover_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cv_document_id UUID REFERENCES cv_documents(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  language VARCHAR(5) DEFAULT 'en',
  recipient_name TEXT,
  recipient_title TEXT,
  company_name TEXT,
  company_address TEXT,
  subject TEXT,
  greeting TEXT,
  opening TEXT,
  body TEXT,
  closing TEXT,
  signoff TEXT,
  job_context JSONB,
  ai_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job application tracker
CREATE TABLE job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cv_document_id UUID REFERENCES cv_documents(id) ON DELETE SET NULL,
  cover_letter_id UUID REFERENCES cover_letters(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT,
  job_description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  applied_at TIMESTAMP WITH TIME ZONE,
  deadline TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  fit_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Share links with analytics
CREATE TABLE share_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code VARCHAR(12) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID NOT NULL,
  settings JSONB DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE share_link_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_link_id UUID REFERENCES share_links(id) ON DELETE CASCADE NOT NULL,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_hash VARCHAR(64),
  user_agent TEXT,
  referrer TEXT,
  country_code VARCHAR(2)
);
```

---

## 3. Core Data Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ User Profile     │     │ Werbeflaechen    │     │ Job Posting      │
│ (Contact info)   │     │ (18 categories)  │     │ (URL/text)       │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ AI Service (Gemini)     │
                    │ - Company research      │
                    │ - Content tailoring     │
                    └─────────────┬───────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ CV Document + Cover     │
                    │ Letter (stored)         │
                    └─────────────┬───────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
        ┌──────────┐        ┌──────────┐        ┌──────────┐
        │ Preview  │        │ PDF      │        │ Share    │
        │ (Editor) │        │ Export   │        │ Link     │
        └──────────┘        └──────────┘        └──────────┘
```

**Werbeflaechen → CV Mapping:**

| Row | Question | Categories | CV Sections |
|-----|----------|------------|-------------|
| 1 | Will you love the job? | vision_mission, motivation, passion, slogan, zitat_motto, highlights | Profile, tagline, cover letter opening |
| 2 | Can you do the job? | erfolge, mehrwert, projekte, referenzen, usp, corporate_design | Achievements, USP, projects, references |
| 3 | Can we work together? | erfahrungswissen, kernkompetenzen, schluesselkompetenzen, kurzprofil, berufliche_erfahrungen, aus_weiterbildungen | Skills, experience, education |

---

## 4. Key Components (ShadCN-based)

**Werbeflaechen:**
- `GridView` - Card-based category display
- `TableView` - Spreadsheet-style editing
- `FlowerView` - Visual diagram
- `BeginnerWizard` - Guided flow for new users
- `AutofillDialog` - AI from job posting

**CV Builder:**
- `CVEditor` - WYSIWYG with inline editing
- `CVPreview` - Full document preview
- `CVToolbar` - Export, theme, share controls
- `SectionEditor` - Per-section editing
- `TemplateSelector` - Choose CV templates

**Cover Letter:**
- `CoverLetterEditor` - Fields for all sections
- `CoverLetterPreview` - Formatted preview

**Application Tracker:**
- `ApplicationList` - Kanban/list view
- `ApplicationCard` - Individual application
- `FitAnalysis` - AI-powered job fit scores

---

## 5. Implementation Phases

### Phase 0: Project Setup ✅
- [x] Create `cv-builder/` with Next.js 15 + ShadCN
- [x] Configure Turborepo workspace
- [x] Set up Supabase connection
- [x] Create landing page

### Phase 1: Auth & User Profile
- [ ] Google OAuth + email/password authentication
- [ ] User profile management page
- [ ] Onboarding flow for new users
- [ ] Protected route middleware

### Phase 2: Werbeflaechen Core
- [ ] Port all 18 category forms from existing app
- [ ] Grid, Table, Flower views
- [ ] Beginner mode with simplified categories
- [ ] Guided wizard for new users
- [ ] AI autofill from job postings
- [ ] Multi-language support (DE/EN)

### Phase 3: CV Builder Core
- [ ] CV CRUD operations
- [ ] Preview with themes/zoom
- [ ] Template selection
- [ ] Data aggregation from Werbeflaechen
- [ ] WYSIWYG inline editing
- [ ] Section drag-and-drop reordering

### Phase 4: AI Integration
- [ ] CV generation from Werbeflaechen + job posting
- [ ] Per-section regeneration
- [ ] Company research extraction
- [ ] Model selection (Gemini variants)

### Phase 5: PDF & Sharing
- [ ] Port Puppeteer PDF generation
- [ ] Share links with settings
- [ ] Visit analytics
- [ ] Privacy controls
- [ ] QR code generation

### Phase 6: Cover Letter
- [ ] Cover letter editor and preview
- [ ] AI generation from CV + job
- [ ] Link to CV documents
- [ ] PDF export

### Phase 7: Application Tracker
- [ ] Job application CRUD
- [ ] Status tracking (Kanban-style)
- [ ] Timeline view
- [ ] Fit score integration
- [ ] Deadline reminders

### Phase 8: Polish & Launch
- [ ] Comprehensive testing
- [ ] Accessibility audit
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Production deployment

---

## 6. Files to Reference/Port from Existing App

**Directly reuse:**
- `nextjs/src/app/api/generate-pdf/route.ts` - PDF generation
- `nextjs/src/app/werbeflaechen/data/categoryMetadata.ts` - Category definitions

**Port with modifications:**
- `nextjs/src/components/cv/CVDocument.tsx` - Document renderer
- `nextjs/src/services/werbeflaechen/werbeflaechen.service.ts` - Service layer
- `nextjs/src/services/ai/gemini.service.ts` - AI service

**Rebuild for ShadCN:**
- All UI components (toolbar, forms, dialogs)
- Context providers
- Page layouts

---

## 7. Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Runtime | Bun |
| UI Library | ShadCN UI |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Google Gemini |
| PDF | Puppeteer |
| Animations | Framer Motion |
| Build | Turborepo |
