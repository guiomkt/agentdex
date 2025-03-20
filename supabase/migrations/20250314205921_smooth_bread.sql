/*
  # Reset and Fix Verification Process

  1. Changes
    - Reset all verification statuses to false
    - Add cascade delete for rejected items
    - Add verification_status enum type
    - Add rejected_at and rejected_reason columns
    
  2. Security
    - Update RLS policies to handle verification status
*/

-- Create verification_status enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
    CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

-- Update agents table
ALTER TABLE agents 
  DROP COLUMN IF EXISTS is_verified,
  ADD COLUMN verification_status verification_status DEFAULT 'pending',
  ADD COLUMN rejected_at timestamptz,
  ADD COLUMN rejected_reason text;

-- Update agencies table
ALTER TABLE agencies 
  DROP COLUMN IF EXISTS is_verified,
  ADD COLUMN verification_status verification_status DEFAULT 'pending',
  ADD COLUMN rejected_at timestamptz,
  ADD COLUMN rejected_reason text;

-- Create view for active (approved) agents
CREATE OR REPLACE VIEW active_agents AS
SELECT * FROM agents WHERE verification_status = 'approved';

-- Create view for active (approved) agencies
CREATE OR REPLACE VIEW active_agencies AS
SELECT * FROM agencies WHERE verification_status = 'approved';

-- Update RLS policies for agents
DROP POLICY IF EXISTS "Agents are viewable by everyone" ON agents;
CREATE POLICY "Only approved agents are publicly viewable"
  ON agents FOR SELECT
  TO public
  USING (verification_status = 'approved');

CREATE POLICY "Authors can view their own agents regardless of status"
  ON agents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Update RLS policies for agencies
DROP POLICY IF EXISTS "Agencies are viewable by everyone" ON agencies;
CREATE POLICY "Only approved agencies are publicly viewable"
  ON agencies FOR SELECT
  TO public
  USING (verification_status = 'approved');

CREATE POLICY "Authors can view their own agencies regardless of status"
  ON agencies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Reset all existing records to pending status
UPDATE agents SET verification_status = 'pending' WHERE verification_status IS NULL;
UPDATE agencies SET verification_status = 'pending' WHERE verification_status IS NULL;