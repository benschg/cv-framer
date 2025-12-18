# CV Builder - Complete Implementation Plan

## Project Overview

An independent CV builder application that combines:

- **CV Generation** - WYSIWYG editor with AI-powered customization
- **Cover Letters** - AI-generated, job-tailored cover letters
- **Application Tracker** - Track job applications with fit scoring

**Target Users:** Individual job seekers with account login

---

## Tech Stack

| Category   | Technology                           |
| ---------- | ------------------------------------ |
| Framework  | Next.js 15 (App Router)              |
| Language   | TypeScript                           |
| Runtime    | Bun                                  |
| UI Library | ShadCN UI                            |
| Styling    | Tailwind CSS                         |
| Database   | Supabase (PostgreSQL)                |
| Auth       | Supabase Auth (Google OAuth + email) |
| AI         | Google Gemini                        |
| PDF        | Puppeteer                            |
| Animations | Framer Motion                        |
| Build      | Turborepo (optional for monorepo)    |

---

## Project Structure

```
cv-builder/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json              # ShadCN config
├── .env.local.example
├── public/
│   ├── fonts/
│   └── images/
└── src/
    ├── app/
    │   ├── layout.tsx           # Root layout
    │   ├── page.tsx             # Landing page
    │   │
    │   ├── (auth)/              # Auth route group (no sidebar)
    │   │   ├── layout.tsx
    │   │   ├── login/page.tsx
    │   │   ├── signup/page.tsx
    │   │   └── forgot-password/page.tsx
    │   │
    │   ├── (dashboard)/         # Main app (with sidebar, protected)
    │   │   ├── layout.tsx       # Dashboard layout with sidebar
    │   │   ├── page.tsx         # Dashboard home
    │   │   │
    │   │   ├── cv/
    │   │   │   ├── page.tsx     # CV list
    │   │   │   ├── new/page.tsx
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx         # CV editor
    │   │   │       └── preview/page.tsx # Full preview
    │   │   │
    │   │   ├── cover-letter/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   │
    │   │   ├── applications/
    │   │   │   ├── page.tsx     # Kanban/list view
    │   │   │   └── [id]/page.tsx
    │   │   │
    │   │   ├── profile/page.tsx
    │   │   └── settings/page.tsx
    │   │
    │   ├── share/[code]/page.tsx  # Public share view
    │   │
    │   └── api/
    │       ├── auth/callback/route.ts
    │       ├── generate-pdf/route.ts
    │       ├── generate-cv/route.ts
    │       ├── regenerate-item/route.ts
    │       ├── cover-letter/
    │       │   ├── route.ts
    │       │   └── generate/route.ts
    │       ├── share/
    │       │   └── route.ts
    │       └── user/profile/route.ts
    │
    ├── components/
    │   ├── ui/                  # ShadCN base components
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── form.tsx
    │   │   ├── input.tsx
    │   │   ├── select.tsx
    │   │   ├── tabs.tsx
    │   │   ├── toast.tsx
    │   │   └── ...
    │   │
    │   ├── shared/              # App-wide shared components
    │   │   ├── app-shell.tsx    # Main layout with sidebar
    │   │   ├── page-header.tsx
    │   │   ├── empty-state.tsx
    │   │   ├── loading-state.tsx
    │   │   └── theme-toggle.tsx
    │   │
    │   ├── auth/
    │   │   ├── login-form.tsx
    │   │   ├── signup-form.tsx
    │   │   └── oauth-buttons.tsx
    │   │
    │   ├── cv/
    │   │   ├── editor/
    │   │   │   ├── cv-editor.tsx
    │   │   │   ├── section-editor.tsx
    │   │   │   └── inline-edit.tsx
    │   │   ├── preview/
    │   │   │   ├── cv-preview.tsx
    │   │   │   ├── cv-page.tsx
    │   │   │   └── cv-document.tsx
    │   │   ├── sections/
    │   │   │   ├── cv-header.tsx
    │   │   │   ├── cv-profile.tsx
    │   │   │   ├── cv-experience.tsx
    │   │   │   ├── cv-education.tsx
    │   │   │   ├── cv-skills.tsx
    │   │   │   └── cv-references.tsx
    │   │   └── toolbar/
    │   │       ├── cv-toolbar.tsx
    │   │       ├── export-dialog.tsx
    │   │       └── share-dialog.tsx
    │   │
    │   ├── cover-letter/
    │   │   ├── cover-letter-editor.tsx
    │   │   └── cover-letter-preview.tsx
    │   │
    │   └── applications/
    │       ├── application-list.tsx
    │       ├── application-card.tsx
    │       └── fit-analysis.tsx
    │
    ├── contexts/
    │   ├── auth-context.tsx
    │   └── cv-context.tsx
    │
    ├── hooks/
    │   ├── use-cv.ts
    │   └── use-pdf-export.ts
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   ├── server.ts
    │   │   └── middleware.ts
    │   ├── ai/
    │   │   └── gemini.ts
    │   └── utils.ts
    │
    ├── services/
    │   ├── cv.service.ts
    │   ├── cover-letter.service.ts
    │   └── share.service.ts
    │
    ├── types/
    │   ├── cv.types.ts
    │   └── database.types.ts
    │
    └── styles/
        ├── globals.css
        └── cv-print.css
```

---

## Database Schema (Supabase)

### Complete Migration SQL

```sql
-- ============================================
-- ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- HELPER FUNCTION: Auto-update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USER PROFILES
-- Stores user profile data shared across all CVs
-- ============================================
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Basic Info
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  photo_url TEXT,

  -- Professional Links
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  portfolio_url TEXT,

  -- Professional Summary (defaults for CVs)
  default_tagline TEXT,
  default_profile TEXT,

  -- Settings
  preferred_language VARCHAR(5) DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CV TEMPLATES
-- Reusable CV layout/style templates
-- ============================================
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

CREATE TRIGGER update_cv_templates_updated_at
  BEFORE UPDATE ON cv_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CV DOCUMENTS
-- Main CV storage
-- ============================================
CREATE TABLE cv_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES cv_templates(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,
  language VARCHAR(5) DEFAULT 'en',

  -- Content (structured sections)
  content JSONB NOT NULL DEFAULT '{}',

  -- AI Generation metadata
  job_context JSONB,
  ai_metadata JSONB,

  -- Display settings
  display_settings JSONB DEFAULT '{"showPhoto": true, "showExperience": true, "theme": "light"}',

  is_default BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cv_documents_user_id ON cv_documents(user_id);
CREATE INDEX idx_cv_documents_user_default ON cv_documents(user_id, is_default);

CREATE TRIGGER update_cv_documents_updated_at
  BEFORE UPDATE ON cv_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COVER LETTERS
-- ============================================
CREATE TABLE cover_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cv_document_id UUID REFERENCES cv_documents(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  language VARCHAR(5) DEFAULT 'en',

  -- Recipient info
  recipient_name TEXT,
  recipient_title TEXT,
  company_name TEXT,
  company_address TEXT,

  -- Letter content
  subject TEXT,
  greeting TEXT,
  opening TEXT,
  body TEXT,
  closing TEXT,
  signoff TEXT,

  -- AI Generation metadata
  job_context JSONB,
  ai_metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cover_letters_user_id ON cover_letters(user_id);

CREATE TRIGGER update_cover_letters_updated_at
  BEFORE UPDATE ON cover_letters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- JOB APPLICATIONS
-- Application tracking
-- ============================================
CREATE TABLE job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cv_document_id UUID REFERENCES cv_documents(id) ON DELETE SET NULL,
  cover_letter_id UUID REFERENCES cover_letters(id) ON DELETE SET NULL,

  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT,
  job_description TEXT,

  -- Status: draft, applied, interview, offer, rejected, accepted, withdrawn
  status VARCHAR(50) DEFAULT 'draft',

  applied_at TIMESTAMP WITH TIME ZONE,
  deadline TIMESTAMP WITH TIME ZONE,

  notes TEXT,

  -- AI Analysis
  fit_analysis JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_status ON job_applications(user_id, status);

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SHARE LINKS
-- ============================================
CREATE TABLE share_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code VARCHAR(12) NOT NULL UNIQUE,

  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- What is being shared: 'cv', 'cover_letter', 'application'
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID NOT NULL,

  -- Settings: theme, showPhoto, privacyLevel, password, etc.
  settings JSONB DEFAULT '{}',

  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,

  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_share_links_short_code ON share_links(short_code);
CREATE INDEX idx_share_links_user_id ON share_links(user_id);

-- ============================================
-- SHARE LINK VISITS (Analytics)
-- ============================================
CREATE TABLE share_link_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_link_id UUID REFERENCES share_links(id) ON DELETE CASCADE NOT NULL,

  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_hash VARCHAR(64),
  user_agent TEXT,
  referrer TEXT,
  country_code VARCHAR(2)
);

CREATE INDEX idx_share_link_visits_link ON share_link_visits(share_link_id);
CREATE INDEX idx_share_link_visits_time ON share_link_visits(visited_at);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- User Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- CV Templates
ALTER TABLE cv_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public templates" ON cv_templates
  FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own templates" ON cv_templates
  FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can insert own templates" ON cv_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own templates" ON cv_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- CV Documents
ALTER TABLE cv_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cv_documents" ON cv_documents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cv_documents" ON cv_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cv_documents" ON cv_documents
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cv_documents" ON cv_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Cover Letters
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cover_letters" ON cover_letters
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cover_letters" ON cover_letters
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cover_letters" ON cover_letters
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cover_letters" ON cover_letters
  FOR DELETE USING (auth.uid() = user_id);

-- Job Applications
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON job_applications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON job_applications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications" ON job_applications
  FOR DELETE USING (auth.uid() = user_id);

-- Share Links
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active share links" ON share_links
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
CREATE POLICY "Users can manage own share links" ON share_links
  FOR ALL USING (auth.uid() = user_id);

-- Share Link Visits
ALTER TABLE share_link_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visits" ON share_link_visits
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Link owners can view visits" ON share_link_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM share_links
      WHERE share_links.id = share_link_visits.share_link_id
      AND share_links.user_id = auth.uid()
    )
  );

-- ============================================
-- INSERT DEFAULT TEMPLATES
-- ============================================
INSERT INTO cv_templates (name, description, is_public, is_default, layout_config, style_config) VALUES
('Classic', 'Traditional two-column CV layout', true, true,
  '{"columns": 2, "sidebarWidth": "35%", "sections": ["header", "profile", "experience", "education", "skills"]}',
  '{"fontFamily": "Inter", "primaryColor": "#1a1a1a", "accentColor": "#2563eb"}'),
('Modern', 'Clean single-column design with accent colors', true, false,
  '{"columns": 1, "sections": ["header", "profile", "skills", "experience", "education"]}',
  '{"fontFamily": "Inter", "primaryColor": "#0f172a", "accentColor": "#8b5cf6"}'),
('Minimal', 'Simple and elegant minimalist design', true, false,
  '{"columns": 1, "sections": ["header", "profile", "experience", "education"]}',
  '{"fontFamily": "Inter", "primaryColor": "#374151", "accentColor": "#374151"}');
```

---

## TypeScript Types

```typescript
// src/types/cv.types.ts

export interface CVDocument {
  id: string;
  user_id: string;
  template_id?: string;
  name: string;
  description?: string;
  language: 'en' | 'de';
  content: CVContent;
  job_context?: JobContext;
  ai_metadata?: AIMetadata;
  display_settings: DisplaySettings;
  is_default: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CVContent {
  tagline?: string;
  profile?: string;
  slogan?: string;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: SkillCategory[];
  keyCompetences?: KeyCompetence[];
  projects?: Project[];
  references?: Reference[];
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface KeyCompetence {
  title: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
}

export interface JobContext {
  company?: string;
  position?: string;
  jobPosting?: string;
  jobPostingUrl?: string;
  companyWebsite?: string;
  customInstructions?: string;
  companyResearch?: CompanyResearch;
}

export interface CompanyResearch {
  company: {
    name: string;
    industry?: string;
    culture?: string[];
    values?: string[];
    techStack?: string[];
  };
  role: {
    title: string;
    level?: string;
    responsibilities?: string[];
    requiredSkills?: string[];
    preferredSkills?: string[];
    keywords?: string[];
  };
  insights?: {
    whatTheyValue?: string;
    toneGuidance?: string;
  };
}

export interface AIMetadata {
  model: string;
  promptVersion: string;
  generatedAt: string;
}

export interface DisplaySettings {
  theme: 'light' | 'dark';
  showPhoto: boolean;
  showExperience: boolean;
  showAttachments: boolean;
  privacyLevel: 'none' | 'personal' | 'full';
}

// src/types/cover-letter.types.ts

export interface CoverLetter {
  id: string;
  user_id: string;
  cv_document_id?: string;
  name: string;
  language: 'en' | 'de';
  recipient_name?: string;
  recipient_title?: string;
  company_name?: string;
  company_address?: string;
  subject?: string;
  greeting?: string;
  opening?: string;
  body?: string;
  closing?: string;
  signoff?: string;
  job_context?: JobContext;
  ai_metadata?: AIMetadata;
  created_at: string;
  updated_at: string;
}

// src/types/application.types.ts

export type ApplicationStatus =
  | 'draft'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'accepted'
  | 'withdrawn';

export interface JobApplication {
  id: string;
  user_id: string;
  cv_document_id?: string;
  cover_letter_id?: string;
  company_name: string;
  job_title: string;
  job_url?: string;
  job_description?: string;
  status: ApplicationStatus;
  applied_at?: string;
  deadline?: string;
  notes?: string;
  fit_analysis?: FitAnalysis;
  created_at: string;
  updated_at: string;
}

export interface FitAnalysis {
  overall_score: number;
  category_scores: Record<string, number>;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}
```

---

## Implementation Phases

### Phase 0: Project Setup ✅

- [x] Next.js 15 with App Router
- [x] ShadCN UI configuration
- [x] Tailwind CSS setup
- [x] Supabase client/server/middleware
- [x] Landing page
- [x] TypeScript configuration

### Phase 1: Auth & User Profile

- [ ] Login page with form
- [ ] Signup page with form
- [ ] Google OAuth integration
- [ ] Forgot password flow
- [ ] Auth callback handler
- [ ] User profile page
- [ ] Profile settings form
- [ ] Onboarding wizard for new users
- [ ] Protected route middleware

### Phase 2: CV Builder Core

- [ ] CV service (CRUD)
- [ ] CV list page
- [ ] CV creation wizard
- [ ] CV editor page
- [ ] CV document renderer
- [ ] CV section components
- [ ] Inline editing component
- [ ] Section drag-and-drop
- [ ] CV toolbar
- [ ] Theme toggle (light/dark)
- [ ] Zoom controls
- [ ] Template selector

### Phase 3: AI Integration

- [ ] Gemini service setup
- [ ] CV generation API route
- [ ] Company research extraction
- [ ] Content tailoring logic
- [ ] Per-section regeneration
- [ ] Regenerate item API route
- [ ] Model selection dropdown
- [ ] Generation preview dialog
- [ ] Custom instructions input

### Phase 4: PDF & Sharing

- [ ] Puppeteer setup
- [ ] PDF generation API route
- [ ] Export options dialog
- [ ] Privacy level controls
- [ ] Share link service
- [ ] Share link API routes
- [ ] Public share page
- [ ] Visit tracking
- [ ] Analytics display
- [ ] QR code generation

### Phase 5: Cover Letter

- [ ] Cover letter service
- [ ] Cover letter list page
- [ ] Cover letter editor
- [ ] Cover letter preview
- [ ] AI generation from CV + job
- [ ] Cover letter PDF export
- [ ] Link to CV documents

### Phase 6: Application Tracker

- [ ] Application service
- [ ] Application list (Kanban view)
- [ ] Application list (Table view)
- [ ] Application detail page
- [ ] Status management
- [ ] Timeline/history view
- [ ] Fit analysis integration
- [ ] Deadline reminders
- [ ] Notes/comments

### Phase 7: Polish & Launch

- [ ] Comprehensive testing
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Error boundary components
- [ ] Loading states
- [ ] Empty states
- [ ] Toast notifications
- [ ] Analytics integration
- [ ] SEO optimization
- [ ] Production deployment

---

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# App URL (for OAuth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## ShadCN Components to Install

```bash
# Core components
npx shadcn@latest add button card dialog form input label select textarea tabs toast

# Navigation
npx shadcn@latest add navigation-menu sidebar breadcrumb dropdown-menu

# Data display
npx shadcn@latest add table badge avatar tooltip accordion progress skeleton

# Forms
npx shadcn@latest add checkbox radio-group switch slider

# Feedback
npx shadcn@latest add alert-dialog alert

# Other
npx shadcn@latest add command separator scroll-area
```

---

## Key Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-slot": "^1.2.4",
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.87.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^11.18.2",
    "lucide-react": "^0.468.0",
    "next": "15.1.0",
    "react": "^19.2.1",
    "react-dom": "^19.2.1",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^22.19.2",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "autoprefixer": "^10.4.22",
    "eslint": "^9.39.1",
    "eslint-config-next": "15.1.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.18",
    "typescript": "^5.9.3"
  }
}
```

### Additional dependencies needed later:

```bash
# PDF Generation (Phase 4)
bun add puppeteer-core @sparticuz/chromium pdf-lib

# AI (Phase 3)
bun add @google/generative-ai

# Optional utilities
bun add date-fns zod react-hook-form @hookform/resolvers
```

---

## Quick Start for Clean Repo

```bash
# 1. Create new Next.js project
bunx create-next-app@latest cv-builder --typescript --tailwind --eslint --app --src-dir

# 2. Navigate to project
cd cv-builder

# 3. Install ShadCN
bunx shadcn@latest init

# 4. Install core dependencies
bun add @supabase/ssr @supabase/supabase-js framer-motion lucide-react

# 5. Install ShadCN components
bunx shadcn@latest add button card dialog form input label select textarea tabs toast

# 6. Copy this PLAN.md to your project root

# 7. Run the database migrations in Supabase SQL Editor

# 8. Create .env.local with your credentials

# 9. Start development
bun dev
```

---

## Notes

- **Puppeteer PDF**: Critical for accurate styling. Use `puppeteer-core` + `@sparticuz/chromium` for Vercel deployment
- **AI Models**: Support Gemini 2.0 Flash (fast), 2.5 Flash (balanced), 2.5 Pro (quality)
- **Privacy Levels**: `none` (no contact), `personal` (email/phone), `full` (all info + references)
- **Languages**: Support DE and EN, user preference stored in profile
