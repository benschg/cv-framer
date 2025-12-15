-- Make certification-documents bucket public
-- This allows users to view their certification documents via direct URLs
UPDATE storage.buckets
SET public = true
WHERE id = 'certification-documents';
