/*
  # Set up Premium User Role and Verification System

  1. Changes
    - Add is_premium_user column to profiles
    - Add is_verified column to agents and agencies
    - Create function to check premium status
    - Add policies for premium users to verify content

  2. Security
    - Maintain existing RLS policies
    - Add new policies for premium users
*/

-- Add is_premium_user column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_premium_user') 
  THEN
    ALTER TABLE profiles
    ADD COLUMN is_premium_user boolean DEFAULT false;
  END IF;
END $$;

-- Add is_verified column to agents if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agents' AND column_name = 'is_verified') 
  THEN
    ALTER TABLE agents
    ADD COLUMN is_verified boolean DEFAULT false;
  END IF;
END $$;

-- Create function to check if user is premium
CREATE OR REPLACE FUNCTION auth.is_premium_user()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_premium_user = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policy for premium users to verify agents
DROP POLICY IF EXISTS "Premium users can verify agents" ON agents;
CREATE POLICY "Premium users can verify agents"
ON agents
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_premium_user = true
  )
);

-- Create policy for premium users to verify agencies
DROP POLICY IF EXISTS "Premium users can verify agencies" ON agencies;
CREATE POLICY "Premium users can verify agencies"
ON agencies
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_premium_user = true
  )
);

-- Set specific user as premium
UPDATE profiles
SET is_premium_user = true
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'rafael@2be.com.br'
);