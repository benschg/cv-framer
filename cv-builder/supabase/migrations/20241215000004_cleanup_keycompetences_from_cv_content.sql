-- Cleanup migration: Remove keyCompetences from cv_documents.content JSONB
-- Key Competences have been moved to profile_key_competences table

UPDATE cv_documents
SET content = content - 'keyCompetences'
WHERE content ? 'keyCompetences';
