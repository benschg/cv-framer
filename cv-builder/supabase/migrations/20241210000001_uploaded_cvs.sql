-- ============================================
-- UPLOADED CVs TABLE
-- Store uploaded CV files for autofill
-- ============================================

CREATE TABLE IF NOT EXISTS uploaded_cvs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- File info
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'docx', 'txt'
  file_size INTEGER,
  storage_path TEXT, -- Supabase storage path if stored

  -- Extracted content
  extracted_text TEXT,
  extraction_metadata JSONB DEFAULT '{}',

  -- Processing status
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uploaded_cvs_user_id ON uploaded_cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_cvs_status ON uploaded_cvs(user_id, status);

DROP TRIGGER IF EXISTS update_uploaded_cvs_updated_at ON uploaded_cvs;
CREATE TRIGGER update_uploaded_cvs_updated_at
  BEFORE UPDATE ON uploaded_cvs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE uploaded_cvs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own uploads" ON uploaded_cvs;
DROP POLICY IF EXISTS "Users can insert own uploads" ON uploaded_cvs;
DROP POLICY IF EXISTS "Users can update own uploads" ON uploaded_cvs;
DROP POLICY IF EXISTS "Users can delete own uploads" ON uploaded_cvs;

CREATE POLICY "Users can view own uploads" ON uploaded_cvs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own uploads" ON uploaded_cvs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own uploads" ON uploaded_cvs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own uploads" ON uploaded_cvs
  FOR DELETE USING (auth.uid() = user_id);
