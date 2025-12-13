-- Create job_fit_analyses table to normalize fit analysis data
CREATE TABLE job_fit_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  strengths TEXT[],
  gaps TEXT[],
  recommendations TEXT[],
  summary TEXT,
  raw_analysis JSONB, -- Keep full AI response for reference
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one analysis per application (can be updated)
  UNIQUE(application_id)
);

-- Create indexes for efficient querying
CREATE INDEX idx_fit_analyses_application ON job_fit_analyses(application_id);
CREATE INDEX idx_fit_analyses_score ON job_fit_analyses(overall_score);
CREATE INDEX idx_fit_analyses_created ON job_fit_analyses(created_at);

-- Enable RLS
ALTER TABLE job_fit_analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access analyses for their own applications
CREATE POLICY "Users can view own fit analyses"
  ON job_fit_analyses FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM job_applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own fit analyses"
  ON job_fit_analyses FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT id FROM job_applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own fit analyses"
  ON job_fit_analyses FOR UPDATE
  USING (
    application_id IN (
      SELECT id FROM job_applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own fit analyses"
  ON job_fit_analyses FOR DELETE
  USING (
    application_id IN (
      SELECT id FROM job_applications WHERE user_id = auth.uid()
    )
  );

-- Migrate existing fit_analysis data from job_applications
INSERT INTO job_fit_analyses (application_id, raw_analysis, created_at, updated_at)
SELECT
  id,
  fit_analysis,
  created_at,
  updated_at
FROM job_applications
WHERE fit_analysis IS NOT NULL AND fit_analysis != '{}';

-- Note: After verifying the migration, you can drop the fit_analysis column:
-- ALTER TABLE job_applications DROP COLUMN fit_analysis;
