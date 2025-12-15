-- CV Education, Skills, and Key Competences Selections
-- Junction tables for per-CV customization

-- ============================================
-- CV EDUCATION SELECTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS cv_education_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID NOT NULL REFERENCES cv_documents(id) ON DELETE CASCADE,
  education_id UUID NOT NULL REFERENCES profile_educations(id) ON DELETE CASCADE,

  -- Selection & Display
  is_selected BOOLEAN DEFAULT TRUE,
  is_favorite BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,

  -- Per-CV Overrides (institution and degree remain from profile)
  description_override TEXT, -- NULL means use profile description

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one entry per CV + education combination
  UNIQUE(cv_id, education_id)
);

-- Indexes for faster queries
CREATE INDEX idx_cv_education_selections_cv_id ON cv_education_selections(cv_id);
CREATE INDEX idx_cv_education_selections_education_id ON cv_education_selections(education_id);

-- RLS Policies
ALTER TABLE cv_education_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cv education selections"
  ON cv_education_selections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_education_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own cv education selections"
  ON cv_education_selections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_education_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own cv education selections"
  ON cv_education_selections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_education_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own cv education selections"
  ON cv_education_selections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_education_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

-- Updated_at trigger
CREATE TRIGGER update_cv_education_selections_updated_at
  BEFORE UPDATE ON cv_education_selections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CV SKILL CATEGORY SELECTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS cv_skill_category_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID NOT NULL REFERENCES cv_documents(id) ON DELETE CASCADE,
  skill_category_id UUID NOT NULL REFERENCES profile_skill_categories(id) ON DELETE CASCADE,

  -- Selection & Display
  is_selected BOOLEAN DEFAULT TRUE,
  is_favorite BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,

  -- Per-CV Overrides (category name remains from profile)
  -- Select which skills to show (subset of profile skills by index)
  selected_skill_indices INTEGER[], -- NULL means show all skills, e.g. [0, 2] shows skills at indices 0 and 2

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one entry per CV + skill category combination
  UNIQUE(cv_id, skill_category_id)
);

-- Indexes for faster queries
CREATE INDEX idx_cv_skill_cat_selections_cv_id ON cv_skill_category_selections(cv_id);
CREATE INDEX idx_cv_skill_cat_selections_skill_cat_id ON cv_skill_category_selections(skill_category_id);

-- RLS Policies
ALTER TABLE cv_skill_category_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cv skill category selections"
  ON cv_skill_category_selections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_skill_category_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own cv skill category selections"
  ON cv_skill_category_selections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_skill_category_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own cv skill category selections"
  ON cv_skill_category_selections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_skill_category_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own cv skill category selections"
  ON cv_skill_category_selections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_skill_category_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

-- Updated_at trigger
CREATE TRIGGER update_cv_skill_cat_selections_updated_at
  BEFORE UPDATE ON cv_skill_category_selections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CV KEY COMPETENCE SELECTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS cv_key_competence_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID NOT NULL REFERENCES cv_documents(id) ON DELETE CASCADE,
  key_competence_id UUID NOT NULL REFERENCES profile_key_competences(id) ON DELETE CASCADE,

  -- Selection & Display
  is_selected BOOLEAN DEFAULT TRUE,
  is_favorite BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,

  -- Per-CV Overrides (title remains from profile)
  description_override TEXT, -- NULL means use profile description

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one entry per CV + key competence combination
  UNIQUE(cv_id, key_competence_id)
);

-- Indexes for faster queries
CREATE INDEX idx_cv_key_comp_selections_cv_id ON cv_key_competence_selections(cv_id);
CREATE INDEX idx_cv_key_comp_selections_key_comp_id ON cv_key_competence_selections(key_competence_id);

-- RLS Policies
ALTER TABLE cv_key_competence_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cv key competence selections"
  ON cv_key_competence_selections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_key_competence_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own cv key competence selections"
  ON cv_key_competence_selections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_key_competence_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own cv key competence selections"
  ON cv_key_competence_selections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_key_competence_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own cv key competence selections"
  ON cv_key_competence_selections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_key_competence_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

-- Updated_at trigger
CREATE TRIGGER update_cv_key_comp_selections_updated_at
  BEFORE UPDATE ON cv_key_competence_selections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
