-- Drop the legacy fit_analysis JSONB column from job_applications
-- Data has been migrated to the normalized job_fit_analyses table

ALTER TABLE job_applications DROP COLUMN IF EXISTS fit_analysis;
