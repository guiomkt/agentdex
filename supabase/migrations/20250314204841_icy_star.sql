/*
  # Fix Profile Policies

  1. Changes
    - Add policies for profiles table to allow proper access
    - Allow authenticated users to read their own profile
    - Allow authenticated users to update their own profile
    - Allow public access to basic profile info

  2. Security
    - Enable RLS on profiles table if not already enabled
    - Restrict profile access based on user ID
    - Allow public read access to non-sensitive fields
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow reading basic profile info for everyone
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
TO public
USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure profiles table has is_premium_user column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'is_premium_user'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_premium_user boolean DEFAULT false;
  END IF;
END $$;