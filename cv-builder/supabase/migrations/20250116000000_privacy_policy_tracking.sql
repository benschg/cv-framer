-- Migration: Privacy Policy Acceptance Tracking
-- Created: 2025-01-16
-- Description: Add fields to track privacy policy acceptance and version

-- Add privacy policy acceptance tracking to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_policy_version VARCHAR(10);

-- Add comment
COMMENT ON COLUMN user_profiles.privacy_policy_accepted_at IS 'Timestamp when user accepted the privacy policy';
COMMENT ON COLUMN user_profiles.privacy_policy_version IS 'Version of privacy policy that was accepted';

-- Create policy acknowledgments table for tracking policy updates
CREATE TABLE IF NOT EXISTS policy_acknowledgments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  policy_type VARCHAR(50) NOT NULL CHECK (policy_type IN ('privacy', 'terms')),
  policy_version VARCHAR(10) NOT NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique acknowledgment per user, policy type, and version
  UNIQUE(user_id, policy_type, policy_version)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_policy_ack_user_id ON policy_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_ack_type_version ON policy_acknowledgments(policy_type, policy_version);

-- Enable Row Level Security
ALTER TABLE policy_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own acknowledgments" ON policy_acknowledgments;
DROP POLICY IF EXISTS "Users can insert own acknowledgments" ON policy_acknowledgments;

-- RLS Policies: Users can only access their own acknowledgments
CREATE POLICY "Users can view own acknowledgments" ON policy_acknowledgments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own acknowledgments" ON policy_acknowledgments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE policy_acknowledgments IS 'Tracks user acknowledgment of policy updates for GDPR compliance';
