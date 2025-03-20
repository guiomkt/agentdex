/*
  # Create reviews table

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, references agents)
      - `user_id` (uuid, references profiles)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `reviews` table
    - Add policies for:
      - Everyone can read reviews
      - Authenticated users can create reviews
      - Users can update/delete their own reviews
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(agent_id, user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews
  FOR SELECT
  USING (true);

-- Only authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON reviews
  FOR DELETE
  USING (auth.uid() = user_id);