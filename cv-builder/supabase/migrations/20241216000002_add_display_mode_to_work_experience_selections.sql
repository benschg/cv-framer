-- Add display_mode column to cv_work_experience_selections
-- This allows users to choose between simple, with_description, or custom display modes

ALTER TABLE cv_work_experience_selections
ADD COLUMN display_mode TEXT DEFAULT 'custom' CHECK (display_mode IN ('simple', 'with_description', 'custom'));

COMMENT ON COLUMN cv_work_experience_selections.display_mode IS 'Display mode: simple (basic info only), with_description (basic + description), custom (full control)';
