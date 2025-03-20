/*
  # Fix profiles table RLS policies

  1. Changes
    - Drop existing policies
    - Add new policies for:
      - Everyone can read profiles
      - Users can update their own profile
      - Authenticated users can insert their own profile
      - System can read/write profiles (for auth hooks)

  2. Security
    - Maintain data privacy while allowing necessary access
    - Ensure profile creation works with auth
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Everyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Enable service role to manage profiles (needed for auth hooks)
CREATE POLICY "Service role can manage all profiles"
  ON profiles
  TO service_role
  USING (true)
  WITH CHECK (true);