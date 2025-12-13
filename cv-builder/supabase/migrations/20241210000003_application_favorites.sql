-- Add is_favorite column to job_applications table
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Create index for favorite filtering
CREATE INDEX IF NOT EXISTS idx_job_applications_favorite ON job_applications(user_id, is_favorite);
