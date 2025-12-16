-- ============================================
-- Migration: Remove Werbeflaechen Module
-- ============================================
-- This migration removes the werbeflaechen_entries table
-- as part of migrating content to profile sections:
-- - Motivation & Vision → profile_motivation_vision
-- - Highlights & Achievements → profile_highlights
-- - Projects → profile_projects
-- ============================================

-- Drop the werbeflaechen_entries table and all associated objects
DROP TABLE IF EXISTS werbeflaechen_entries CASCADE;

-- Note: No data migration needed - users will populate
-- new profile sections from scratch or via AI import
