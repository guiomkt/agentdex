/*
  # Add agency reviews system

  1. New Tables
    - `agency_reviews`
      - `id` (uuid, primary key)
      - `agency_id` (uuid, references agencies)
      - `user_id` (uuid, references profiles)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `agency_reviews` table
    - Add policies for:
      - Everyone can read reviews
      - Authenticated users can create reviews
      - Users can update/delete their own reviews
*/

CREATE TABLE IF NOT EXISTS agency_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(agency_id, user_id)
);

ALTER TABLE agency_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Agency reviews are viewable by everyone"
  ON agency_reviews
  FOR SELECT
  USING (true);

-- Only authenticated users can create reviews
CREATE POLICY "Authenticated users can create agency reviews"
  ON agency_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own reviews
CREATE POLICY "Users can update their own agency reviews"
  ON agency_reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own agency reviews"
  ON agency_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Insert sample reviews
INSERT INTO agency_reviews (agency_id, user_id, rating, comment)
SELECT 
  id as agency_id,
  'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f' as user_id,
  5 as rating,
  CASE 
    WHEN name = 'TechMinds AI' THEN 'Excelente equipe técnica e atendimento excepcional!'
    WHEN name = 'AI Solutions Brasil' THEN 'Profissionais altamente capacitados e resultados impressionantes.'
    WHEN name = 'Nexus Intelligence' THEN 'Inovadores e eficientes em suas soluções.'
    WHEN name = 'DataFlow Labs' THEN 'Ótima experiência trabalhando com eles.'
    WHEN name = 'Cognitive Systems' THEN 'Entregaram além das expectativas.'
    WHEN name = 'Neural Innovations' THEN 'Equipe muito competente e projetos bem executados.'
  END as comment
FROM agencies;