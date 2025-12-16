-- Migration: Add Motivation & Vision, Highlights & Achievements, and Projects tables
-- This migration creates new profile sections to replace Werbeflaechen functionality

-- ============================================================================
-- Profile Motivation & Vision
-- ============================================================================
-- Stores intrinsic motivation: vision, mission, purpose, career goals, passions
CREATE TABLE profile_motivation_vision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vision TEXT,
  mission TEXT,
  purpose TEXT,
  what_drives_you TEXT,
  why_this_field TEXT,
  career_goals TEXT,
  passions TEXT[], -- Array of passion items
  how_passions_relate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One motivation_vision entry per user
);

-- ============================================================================
-- Profile Highlights & Achievements
-- ============================================================================
-- Stores career highlights, achievements with metrics, mehrwert, and USP
CREATE TABLE profile_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('highlight', 'achievement', 'mehrwert', 'usp')),
  title TEXT NOT NULL,
  description TEXT,
  metric TEXT, -- For achievements (e.g., "40% increase", "$2M saved")
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Profile Projects
-- ============================================================================
-- Stores key projects with role, technologies, outcomes
CREATE TABLE profile_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  role TEXT,
  technologies TEXT[], -- Array of tech/tools used
  url TEXT,
  start_date DATE,
  end_date DATE,
  current BOOLEAN DEFAULT false, -- Currently working on this project
  outcome TEXT, -- Results or impact of the project
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CV Project Selections
-- ============================================================================
-- Junction table for selecting profile projects in CVs
CREATE TABLE cv_project_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID NOT NULL REFERENCES cv_documents(id) ON DELETE CASCADE,
  profile_project_id UUID NOT NULL REFERENCES profile_projects(id) ON DELETE CASCADE,
  is_selected BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  description_override TEXT, -- CV-specific description override
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cv_id, profile_project_id)
);

-- ============================================================================
-- Add personal_motto to user_profiles table
-- ============================================================================
-- Merges slogan and zitat_motto from Werbeflaechen into profile
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS personal_motto TEXT;

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX idx_profile_highlights_user_id ON profile_highlights(user_id);
CREATE INDEX idx_profile_highlights_type ON profile_highlights(type);
CREATE INDEX idx_profile_projects_user_id ON profile_projects(user_id);
CREATE INDEX idx_cv_project_selections_cv_id ON cv_project_selections(cv_id);
CREATE INDEX idx_cv_project_selections_profile_project_id ON cv_project_selections(profile_project_id);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE profile_motivation_vision ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_project_selections ENABLE ROW LEVEL SECURITY;

-- Policies for profile_motivation_vision
CREATE POLICY "Users can view own motivation_vision"
  ON profile_motivation_vision FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own motivation_vision"
  ON profile_motivation_vision FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own motivation_vision"
  ON profile_motivation_vision FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own motivation_vision"
  ON profile_motivation_vision FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for profile_highlights
CREATE POLICY "Users can view own highlights"
  ON profile_highlights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own highlights"
  ON profile_highlights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own highlights"
  ON profile_highlights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own highlights"
  ON profile_highlights FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for profile_projects
CREATE POLICY "Users can view own projects"
  ON profile_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON profile_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON profile_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON profile_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for cv_project_selections
CREATE POLICY "Users can manage own cv_project_selections"
  ON cv_project_selections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_project_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Updated At Trigger Functions
-- ============================================================================

-- Create trigger function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to new tables
CREATE TRIGGER update_profile_motivation_vision_updated_at
  BEFORE UPDATE ON profile_motivation_vision
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_highlights_updated_at
  BEFORE UPDATE ON profile_highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_projects_updated_at
  BEFORE UPDATE ON profile_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_project_selections_updated_at
  BEFORE UPDATE ON cv_project_selections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
