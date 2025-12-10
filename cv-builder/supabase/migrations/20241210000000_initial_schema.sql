-- ============================================
-- CV BUILDER - INITIAL SCHEMA
-- ============================================

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
CREATE TABLE IF NOT EXISTS user_profiles (
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

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- WERBEFLAECHEN ENTRIES
-- 18-category self-marketing framework
-- ============================================
CREATE TABLE IF NOT EXISTS werbeflaechen_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  language VARCHAR(5) NOT NULL DEFAULT 'en',
  category_key VARCHAR(50) NOT NULL,
  row_number INTEGER NOT NULL CHECK (row_number BETWEEN 1 AND 3),

  content JSONB NOT NULL DEFAULT '{}',
  is_complete BOOLEAN DEFAULT false,

  -- AI Fit Scores
  cv_coverage INTEGER CHECK (cv_coverage BETWEEN 1 AND 10),
  job_match INTEGER CHECK (job_match BETWEEN 1 AND 10),
  fit_reasoning TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, language, category_key)
);

CREATE INDEX IF NOT EXISTS idx_werbeflaechen_user_id ON werbeflaechen_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_werbeflaechen_user_lang ON werbeflaechen_entries(user_id, language);
CREATE INDEX IF NOT EXISTS idx_werbeflaechen_category ON werbeflaechen_entries(category_key);

DROP TRIGGER IF EXISTS update_werbeflaechen_entries_updated_at ON werbeflaechen_entries;
CREATE TRIGGER update_werbeflaechen_entries_updated_at
  BEFORE UPDATE ON werbeflaechen_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CV TEMPLATES
-- Reusable CV layout/style templates
-- ============================================
CREATE TABLE IF NOT EXISTS cv_templates (
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

DROP TRIGGER IF EXISTS update_cv_templates_updated_at ON cv_templates;
CREATE TRIGGER update_cv_templates_updated_at
  BEFORE UPDATE ON cv_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CV DOCUMENTS
-- Main CV storage
-- ============================================
CREATE TABLE IF NOT EXISTS cv_documents (
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

  -- Snapshot of werbeflaechen data used
  werbeflaechen_snapshot JSONB,

  -- Display settings
  display_settings JSONB DEFAULT '{"showPhoto": true, "showExperience": true, "theme": "light"}',

  is_default BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cv_documents_user_id ON cv_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_documents_user_default ON cv_documents(user_id, is_default);

DROP TRIGGER IF EXISTS update_cv_documents_updated_at ON cv_documents;
CREATE TRIGGER update_cv_documents_updated_at
  BEFORE UPDATE ON cv_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COVER LETTERS
-- ============================================
CREATE TABLE IF NOT EXISTS cover_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cv_id UUID REFERENCES cv_documents(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  language VARCHAR(5) DEFAULT 'en',

  -- Content stored as JSONB
  content JSONB DEFAULT '{}',

  -- AI Generation metadata
  job_context JSONB,
  ai_metadata JSONB,

  -- Soft delete
  is_archived BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters(user_id);

DROP TRIGGER IF EXISTS update_cover_letters_updated_at ON cover_letters;
CREATE TRIGGER update_cover_letters_updated_at
  BEFORE UPDATE ON cover_letters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- JOB APPLICATIONS
-- Application tracking
-- ============================================
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cv_id UUID REFERENCES cv_documents(id) ON DELETE SET NULL,
  cover_letter_id UUID REFERENCES cover_letters(id) ON DELETE SET NULL,

  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT,
  job_description TEXT,
  location TEXT,
  salary_range TEXT,

  -- Status: draft, applied, screening, interview, offer, accepted, rejected, withdrawn
  status VARCHAR(50) DEFAULT 'draft',

  applied_at TIMESTAMP WITH TIME ZONE,
  deadline TIMESTAMP WITH TIME ZONE,

  notes TEXT,
  contact_name TEXT,
  contact_email TEXT,

  -- AI Analysis
  fit_analysis JSONB,

  -- Soft delete
  is_archived BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_job_applications_archived ON job_applications(user_id, is_archived);

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SHARE LINKS
-- ============================================
CREATE TABLE IF NOT EXISTS share_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cv_id UUID REFERENCES cv_documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  share_token VARCHAR(32) NOT NULL UNIQUE,
  privacy_level VARCHAR(20) DEFAULT 'none',

  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  password_hash TEXT,

  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(share_token);
CREATE INDEX IF NOT EXISTS idx_share_links_user_id ON share_links(user_id);
CREATE INDEX IF NOT EXISTS idx_share_links_cv_id ON share_links(cv_id);

DROP TRIGGER IF EXISTS update_share_links_updated_at ON share_links;
CREATE TRIGGER update_share_links_updated_at
  BEFORE UPDATE ON share_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SHARE LINK VISITS (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS share_link_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_link_id UUID REFERENCES share_links(id) ON DELETE CASCADE NOT NULL,

  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  visitor_ip TEXT,
  user_agent TEXT,
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_share_link_visits_link ON share_link_visits(share_link_id);
CREATE INDEX IF NOT EXISTS idx_share_link_visits_time ON share_link_visits(visited_at);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- User Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Werbeflaechen Entries
ALTER TABLE werbeflaechen_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own entries" ON werbeflaechen_entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON werbeflaechen_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON werbeflaechen_entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON werbeflaechen_entries;

CREATE POLICY "Users can view own entries" ON werbeflaechen_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON werbeflaechen_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON werbeflaechen_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON werbeflaechen_entries
  FOR DELETE USING (auth.uid() = user_id);

-- CV Templates
ALTER TABLE cv_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public templates" ON cv_templates;
DROP POLICY IF EXISTS "Users can view own templates" ON cv_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON cv_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON cv_templates;

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

DROP POLICY IF EXISTS "Users can view own cv_documents" ON cv_documents;
DROP POLICY IF EXISTS "Users can insert own cv_documents" ON cv_documents;
DROP POLICY IF EXISTS "Users can update own cv_documents" ON cv_documents;
DROP POLICY IF EXISTS "Users can delete own cv_documents" ON cv_documents;

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

DROP POLICY IF EXISTS "Users can view own cover_letters" ON cover_letters;
DROP POLICY IF EXISTS "Users can insert own cover_letters" ON cover_letters;
DROP POLICY IF EXISTS "Users can update own cover_letters" ON cover_letters;
DROP POLICY IF EXISTS "Users can delete own cover_letters" ON cover_letters;

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

DROP POLICY IF EXISTS "Users can view own applications" ON job_applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON job_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON job_applications;
DROP POLICY IF EXISTS "Users can delete own applications" ON job_applications;

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

DROP POLICY IF EXISTS "Anyone can view active share links" ON share_links;
DROP POLICY IF EXISTS "Users can manage own share links" ON share_links;

CREATE POLICY "Anyone can view active share links" ON share_links
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
CREATE POLICY "Users can manage own share links" ON share_links
  FOR ALL USING (auth.uid() = user_id);

-- Share Link Visits
ALTER TABLE share_link_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert visits" ON share_link_visits;
DROP POLICY IF EXISTS "Link owners can view visits" ON share_link_visits;

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
  '{"fontFamily": "Inter", "primaryColor": "#374151", "accentColor": "#374151"}')
ON CONFLICT DO NOTHING;
