-- ============================================
-- REMOVE BASIC INFO FROM USER_PROFILES
-- ============================================
-- These fields are now stored in auth.users.raw_user_meta_data:
-- - first_name
-- - last_name
-- - phone
-- - location
--
-- Email is already in auth.users.email
-- Photo is stored in profile_photos table
-- ============================================

-- Drop the columns that are now in auth.user_metadata
ALTER TABLE user_profiles DROP COLUMN IF EXISTS first_name;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS last_name;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS email;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS location;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS photo_url;

-- Add a comment explaining the change
COMMENT ON TABLE user_profiles IS 'Stores user profile data NOT in auth.users.raw_user_meta_data. Basic info (name, phone, location) is stored in auth metadata. This table holds professional links, CV defaults, and settings.';
