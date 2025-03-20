/*
  # Update agents table policies

  1. Changes
    - Update the SELECT policy to ensure public access to all agent data
    - Add explicit JOIN permissions for profiles table

  2. Security
    - Maintain RLS enabled
    - Keep existing policies for INSERT, UPDATE, DELETE
    - Add explicit public access for agent details
*/

CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text,
  website_url text,
  price_type text NOT NULL CHECK (price_type IN ('free', 'paid', 'freemium')),
  category text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Agents are viewable by everyone" ON agents;
DROP POLICY IF EXISTS "Authenticated users can create agents" ON agents;
DROP POLICY IF EXISTS "Users can update their own agents" ON agents;
DROP POLICY IF EXISTS "Users can delete their own agents" ON agents;

-- Everyone can view agents with full access to joins
CREATE POLICY "Agents are viewable by everyone"
  ON agents
  FOR SELECT
  USING (true);

-- Only authenticated users can create agents
CREATE POLICY "Authenticated users can create agents"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own agents
CREATE POLICY "Users can update their own agents"
  ON agents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own agents
CREATE POLICY "Users can delete their own agents"
  ON agents
  FOR DELETE
  USING (auth.uid() = user_id);