-- Add AI reasoning column to werbeflaechen_entries
-- This stores per-field reasoning from AI for why values were set

ALTER TABLE werbeflaechen_entries
ADD COLUMN IF NOT EXISTS ai_reasoning JSONB DEFAULT '{}';

-- Comment for documentation
COMMENT ON COLUMN werbeflaechen_entries.ai_reasoning IS 'Per-field AI reasoning explaining why each value was extracted/set from CV';
COMMENT ON COLUMN werbeflaechen_entries.cv_coverage IS 'Score 1-10: How well the CV covers this category';
COMMENT ON COLUMN werbeflaechen_entries.job_match IS 'Score 1-10: How well this matches typical job requirements';
COMMENT ON COLUMN werbeflaechen_entries.fit_reasoning IS 'AI explanation of the overall coverage/match assessment';
