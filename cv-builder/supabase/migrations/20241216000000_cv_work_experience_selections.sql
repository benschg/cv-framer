-- CV Work Experience Selections
-- Junction table for per-CV customization of work experiences

CREATE TABLE IF NOT EXISTS cv_work_experience_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID NOT NULL REFERENCES cv_documents(id) ON DELETE CASCADE,
  work_experience_id UUID NOT NULL REFERENCES profile_work_experiences(id) ON DELETE CASCADE,

  -- Selection & Display
  is_selected BOOLEAN DEFAULT TRUE,
  is_favorite BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,

  -- Per-CV Overrides (company and title remain from profile)
  description_override TEXT, -- NULL means use profile description

  -- Bullet Point Selection (subset of profile bullets by index)
  selected_bullet_indices INTEGER[], -- NULL means show all bullets, e.g. [0, 2] shows bullets at indices 0 and 2

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one entry per CV + work experience combination
  UNIQUE(cv_id, work_experience_id)
);

-- Indexes for faster queries
CREATE INDEX idx_cv_work_exp_selections_cv_id ON cv_work_experience_selections(cv_id);
CREATE INDEX idx_cv_work_exp_selections_work_exp_id ON cv_work_experience_selections(work_experience_id);

-- RLS Policies
ALTER TABLE cv_work_experience_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cv work experience selections"
  ON cv_work_experience_selections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_work_experience_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own cv work experience selections"
  ON cv_work_experience_selections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_work_experience_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own cv work experience selections"
  ON cv_work_experience_selections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_work_experience_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own cv work experience selections"
  ON cv_work_experience_selections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM cv_documents
      WHERE cv_documents.id = cv_work_experience_selections.cv_id
      AND cv_documents.user_id = auth.uid()
    )
  );

-- Updated_at trigger
CREATE TRIGGER update_cv_work_exp_selections_updated_at
  BEFORE UPDATE ON cv_work_experience_selections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
