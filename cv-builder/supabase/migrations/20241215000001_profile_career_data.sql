-- Profile Career Data Tables
-- These tables store the user's master career information that can be reused across all CVs

-- ============================================
-- WORK EXPERIENCES
-- ============================================
CREATE TABLE IF NOT EXISTS profile_work_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  start_date TEXT NOT NULL, -- Format: YYYY-MM
  end_date TEXT, -- Format: YYYY-MM, null if current
  current BOOLEAN DEFAULT FALSE,
  description TEXT,
  bullets TEXT[], -- Array of achievement bullets
  display_order INTEGER DEFAULT 0, -- For custom sorting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_profile_work_experiences_user_id ON profile_work_experiences(user_id);
CREATE INDEX idx_profile_work_experiences_display_order ON profile_work_experiences(user_id, display_order);

-- RLS Policies
ALTER TABLE profile_work_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own work experiences"
  ON profile_work_experiences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work experiences"
  ON profile_work_experiences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work experiences"
  ON profile_work_experiences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work experiences"
  ON profile_work_experiences
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- EDUCATION
-- ============================================
CREATE TABLE IF NOT EXISTS profile_educations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT,
  start_date TEXT NOT NULL, -- Format: YYYY-MM
  end_date TEXT, -- Format: YYYY-MM
  description TEXT,
  grade TEXT, -- GPA, grade, honors, etc.
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_profile_educations_user_id ON profile_educations(user_id);
CREATE INDEX idx_profile_educations_display_order ON profile_educations(user_id, display_order);

-- RLS Policies
ALTER TABLE profile_educations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own educations"
  ON profile_educations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own educations"
  ON profile_educations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own educations"
  ON profile_educations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own educations"
  ON profile_educations
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SKILL CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS profile_skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  skills TEXT[] NOT NULL, -- Array of skill names
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_profile_skill_categories_user_id ON profile_skill_categories(user_id);
CREATE INDEX idx_profile_skill_categories_display_order ON profile_skill_categories(user_id, display_order);

-- RLS Policies
ALTER TABLE profile_skill_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own skill categories"
  ON profile_skill_categories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skill categories"
  ON profile_skill_categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill categories"
  ON profile_skill_categories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skill categories"
  ON profile_skill_categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CERTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS profile_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date TEXT, -- Format: YYYY-MM
  expiry_date TEXT, -- Format: YYYY-MM
  url TEXT, -- Verification URL
  credential_id TEXT,
  document_url TEXT, -- URL to uploaded certificate document
  document_name TEXT, -- Original filename
  storage_path TEXT, -- Storage path in Supabase storage
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_profile_certifications_user_id ON profile_certifications(user_id);
CREATE INDEX idx_profile_certifications_display_order ON profile_certifications(user_id, display_order);

-- RLS Policies
ALTER TABLE profile_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own certifications"
  ON profile_certifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certifications"
  ON profile_certifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certifications"
  ON profile_certifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certifications"
  ON profile_certifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- REFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS profile_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  relationship TEXT, -- e.g., "Manager", "Colleague", "Professor"
  email TEXT,
  phone TEXT,
  quote TEXT, -- Optional testimonial quote
  linked_position TEXT, -- Optional link to a work experience position
  document_url TEXT, -- URL to uploaded reference letter
  document_name TEXT, -- Original filename
  storage_path TEXT, -- Storage path in Supabase storage
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_profile_references_user_id ON profile_references(user_id);
CREATE INDEX idx_profile_references_display_order ON profile_references(user_id, display_order);

-- RLS Policies
ALTER TABLE profile_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own references"
  ON profile_references
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own references"
  ON profile_references
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own references"
  ON profile_references
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own references"
  ON profile_references
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_profile_work_experiences_updated_at
  BEFORE UPDATE ON profile_work_experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_educations_updated_at
  BEFORE UPDATE ON profile_educations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_skill_categories_updated_at
  BEFORE UPDATE ON profile_skill_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_certifications_updated_at
  BEFORE UPDATE ON profile_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_references_updated_at
  BEFORE UPDATE ON profile_references
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Create storage buckets for documents if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('certification-documents', 'certification-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('reference-letters', 'reference-letters', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for certification documents
CREATE POLICY "Users can upload their own certification documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'certification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own certification documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'certification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own certification documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'certification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for reference letters
CREATE POLICY "Users can upload their own reference letters"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'reference-letters' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own reference letters"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'reference-letters' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own reference letters"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'reference-letters' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
