-- ============================================
-- PROFILE PHOTOS
-- Multiple photo management with primary selection
-- ============================================

-- ============================================
-- TABLE: profile_photos
-- ============================================
CREATE TABLE IF NOT EXISTS profile_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Storage reference
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,

  -- Image metadata
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  width INTEGER,
  height INTEGER,

  -- Status and ordering
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Upload metadata
  upload_source VARCHAR(50) DEFAULT 'manual',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profile_photos_user_id ON profile_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_photos_primary ON profile_photos(user_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_profile_photos_order ON profile_photos(user_id, display_order);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update timestamps
DROP TRIGGER IF EXISTS update_profile_photos_updated_at ON profile_photos;
CREATE TRIGGER update_profile_photos_updated_at
  BEFORE UPDATE ON profile_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Ensure only one primary photo per user
-- ============================================
CREATE OR REPLACE FUNCTION ensure_single_primary_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    -- Unset other primary photos for this user
    UPDATE profile_photos
    SET is_primary = false
    WHERE user_id = NEW.user_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_primary_photo_trigger ON profile_photos;
CREATE TRIGGER ensure_single_primary_photo_trigger
  BEFORE INSERT OR UPDATE ON profile_photos
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION ensure_single_primary_photo();

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own photos" ON profile_photos;
CREATE POLICY "Users can view own photos" ON profile_photos
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own photos" ON profile_photos;
CREATE POLICY "Users can insert own photos" ON profile_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own photos" ON profile_photos;
CREATE POLICY "Users can update own photos" ON profile_photos
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own photos" ON profile_photos;
CREATE POLICY "Users can delete own photos" ON profile_photos
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ALTER: user_profiles
-- Add reference to primary photo
-- ============================================
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS primary_photo_id UUID REFERENCES profile_photos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_primary_photo ON user_profiles(primary_photo_id);

COMMENT ON COLUMN user_profiles.photo_url IS 'DEPRECATED: Legacy field for backward compatibility. Use primary_photo_id instead.';

-- ============================================
-- ALTER: cv_documents
-- Add optional photo override per CV
-- ============================================
ALTER TABLE cv_documents
ADD COLUMN IF NOT EXISTS selected_photo_id UUID REFERENCES profile_photos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cv_documents_photo ON cv_documents(selected_photo_id);

COMMENT ON COLUMN cv_documents.selected_photo_id IS 'Optional: Override primary photo with specific photo for this CV';

-- ============================================
-- STORAGE BUCKET SETUP
-- Note: This creates the bucket if it doesn't exist
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,  -- Public bucket for easy access
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE RLS POLICIES
-- ============================================

-- Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own photos
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own photos
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access (photos are public)
DROP POLICY IF EXISTS "Public can view photos" ON storage.objects;
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
