-- Profile Key Competences Table
-- Stores user's key professional competences for use across CVs

-- ============================================
-- KEY COMPETENCES
-- ============================================
CREATE TABLE IF NOT EXISTS profile_key_competences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_profile_key_competences_user_id ON profile_key_competences(user_id);
CREATE INDEX idx_profile_key_competences_display_order ON profile_key_competences(user_id, display_order);

-- RLS Policies
ALTER TABLE profile_key_competences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own key competences"
  ON profile_key_competences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own key competences"
  ON profile_key_competences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own key competences"
  ON profile_key_competences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own key competences"
  ON profile_key_competences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_profile_key_competences_updated_at
  BEFORE UPDATE ON profile_key_competences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
