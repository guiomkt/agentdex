/*
  # Add agencies table and sample data

  1. New Tables
    - `agencies`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `logo_url` (text)
      - `website_url` (text)
      - `location` (text)
      - `specialties` (text[])
      - `user_id` (uuid, references profiles)
      - `is_verified` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `agencies` table
    - Add policies for viewing and managing agencies
*/

-- Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  logo_url text,
  website_url text,
  location text NOT NULL,
  specialties text[] NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_verified boolean DEFAULT false,
  total_clients integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Agencies are viewable by everyone"
  ON agencies
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create agencies"
  ON agencies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own agencies"
  ON agencies
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agencies"
  ON agencies
  FOR DELETE
  USING (auth.uid() = user_id);

-- Insert sample agencies
INSERT INTO agencies (name, description, logo_url, website_url, location, specialties, user_id, is_verified, total_clients)
VALUES
  (
    'TechMinds AI',
    'Especialistas em desenvolvimento de soluções personalizadas de IA para empresas de todos os portes. Nossa equipe combina expertise técnica com conhecimento de negócios para entregar resultados excepcionais.',
    'https://source.unsplash.com/random/400x400?tech&sig=1',
    'https://example.com/techminds',
    'São Paulo, SP',
    ARRAY['Chatbots', 'Machine Learning', 'Automação de Processos'],
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    true,
    75
  ),
  (
    'AI Solutions Brasil',
    'Transformando negócios através da inteligência artificial. Oferecemos consultoria especializada e desenvolvimento de agentes de IA que impulsionam a eficiência operacional.',
    'https://source.unsplash.com/random/400x400?ai&sig=2',
    'https://example.com/aisolutions',
    'Rio de Janeiro, RJ',
    ARRAY['Análise de Dados', 'IA Generativa', 'Automação'],
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    true,
    120
  ),
  (
    'Nexus Intelligence',
    'Criamos agentes de IA que revolucionam a forma como as empresas operam. Nossa abordagem inovadora combina tecnologia de ponta com estratégias comprovadas de mercado.',
    'https://source.unsplash.com/random/400x400?business&sig=3',
    'https://example.com/nexus',
    'Curitiba, PR',
    ARRAY['NLP', 'Computer Vision', 'RPA'],
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    false,
    45
  ),
  (
    'DataFlow Labs',
    'Especialistas em soluções de IA para otimização de processos e análise de dados. Ajudamos empresas a tomar decisões mais inteligentes com tecnologia avançada.',
    'https://source.unsplash.com/random/400x400?data&sig=4',
    'https://example.com/dataflow',
    'Belo Horizonte, MG',
    ARRAY['Big Data', 'Machine Learning', 'IA Preditiva'],
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    true,
    90
  ),
  (
    'Cognitive Systems',
    'Desenvolvemos soluções de IA que transformam dados em insights acionáveis. Nossa expertise abrange desde chatbots até sistemas complexos de automação.',
    'https://source.unsplash.com/random/400x400?technology&sig=5',
    'https://example.com/cognitive',
    'Porto Alegre, RS',
    ARRAY['Deep Learning', 'Chatbots', 'Automação'],
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    false,
    60
  ),
  (
    'Neural Innovations',
    'Pioneiros em soluções de IA para o mercado brasileiro. Nossa missão é democratizar o acesso à inteligência artificial para empresas de todos os tamanhos.',
    'https://source.unsplash.com/random/400x400?innovation&sig=6',
    'https://example.com/neural',
    'Recife, PE',
    ARRAY['IA Generativa', 'NLP', 'Visão Computacional'],
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    true,
    85
  );