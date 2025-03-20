/*
  # Create agents and related tables

  1. New Tables
    - `agents`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image_url` (text)
      - `website_url` (text)
      - `price_type` (text) - 'free', 'paid', 'freemium'
      - `category` (text)
      - `user_id` (uuid, references profiles)
      - `is_premium` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `agents` table
    - Add policies for:
      - Everyone can read agents
      - Authenticated users can create agents
      - Users can update/delete their own agents
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

-- Everyone can view agents
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