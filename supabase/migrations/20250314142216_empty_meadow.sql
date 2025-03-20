/*
  # Add seed data with test user and agents

  1. Changes
    - Create a test user in auth.users
    - Create a profile for the test user
    - Add sample agents with reviews
    - Add sample reviews for the agents

  2. Data
    - Test user with email/password authentication
    - Featured agents from the homepage
    - Sample reviews for social proof
*/

-- Create test user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
  'demo@agentdex.com',
  crypt('demo123', gen_salt('bf')),
  now(),
  '{"name": "Demo User"}'
) ON CONFLICT (id) DO NOTHING;

-- Create profile for test user
INSERT INTO public.profiles (id, username, full_name, avatar_url)
VALUES (
  'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
  'demouser',
  'Demo User',
  'https://source.unsplash.com/random/150x150?avatar'
) ON CONFLICT (id) DO NOTHING;

-- Insert featured agents
INSERT INTO public.agents (id, name, description, image_url, website_url, price_type, category, user_id, is_premium)
VALUES
  (
    'd1e6f4a0-3e7c-4b1a-9f1a-8d9b7c1e2d3b',
    'Oraczen''s Zen Platform',
    'Creating the Generative Enterprise. Uma plataforma completa para automação de processos empresariais usando IA generativa. Integre facilmente com suas ferramentas existentes e crie fluxos de trabalho inteligentes.',
    'https://source.unsplash.com/random/800x600?ai&sig=1',
    'https://example.com/oraczen',
    'paid',
    'automation',
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    true
  ),
  (
    'f2c8e5b1-4d9a-5c2b-8e3d-7f4a6b5c4d3e',
    'Agentverse',
    'Search and discover AI agents. Uma plataforma de busca e descoberta de agentes de IA, com recursos avançados de filtragem e comparação. Encontre o agente perfeito para suas necessidades.',
    'https://source.unsplash.com/random/800x600?search&sig=2',
    'https://example.com/agentverse',
    'free',
    'research',
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    true
  ),
  (
    'a3b7c9d2-6e8f-4a5b-9c1d-2e3f4a5b6c7d',
    'Vessium',
    'From words to agentic workflows, use natural language prompts to automate business operations. Transforme comandos em linguagem natural em automações poderosas para seu negócio.',
    'https://source.unsplash.com/random/800x600?business&sig=3',
    'https://example.com/vessium',
    'paid',
    'productivity',
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    false
  ),
  (
    'b4d8e2f6-7a9c-3b5d-8e4f-1a2b3c4d5e6f',
    'Beam AI',
    'Platform for agentic process automation. Uma plataforma moderna para automação de processos usando agentes de IA. Ideal para empresas que buscam eficiência e inovação.',
    'https://source.unsplash.com/random/800x600?technology&sig=4',
    'https://example.com/beam-ai',
    'freemium',
    'machine_learning',
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    false
  );

-- Create some sample reviews
INSERT INTO public.reviews (agent_id, user_id, rating, comment)
VALUES
  (
    'd1e6f4a0-3e7c-4b1a-9f1a-8d9b7c1e2d3b',
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    5,
    'Excelente plataforma! Revolucionou nossos processos internos.'
  ),
  (
    'f2c8e5b1-4d9a-5c2b-8e3d-7f4a6b5c4d3e',
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    4,
    'Muito útil para encontrar agentes específicos para nossas necessidades.'
  ),
  (
    'a3b7c9d2-6e8f-4a5b-9c1d-2e3f4a5b6c7d',
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    5,
    'A interface de linguagem natural é impressionante!'
  ),
  (
    'b4d8e2f6-7a9c-3b5d-8e4f-1a2b3c4d5e6f',
    'f8b9d3a1-2c4e-4b6f-8e9d-5a6b7c8d9e0f',
    4,
    'Ótima opção para começar com automação de processos.'
  );