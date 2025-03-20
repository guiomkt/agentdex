/*
  # Add CNPJ field to agencies table

  1. Changes
    - Add CNPJ column to agencies table
    - Add unique constraint and validation
    - Update existing agencies with unique CNPJs

  2. Security
    - Maintain existing RLS policies
*/

-- First add the column without constraints
ALTER TABLE agencies 
ADD COLUMN cnpj text;

-- Update existing agencies with unique CNPJs
UPDATE agencies 
SET cnpj = CASE 
  WHEN name = 'TechMinds AI' THEN '12345678000101'
  WHEN name = 'AI Solutions Brasil' THEN '23456789000102'
  WHEN name = 'Nexus Intelligence' THEN '34567890000103'
  WHEN name = 'DataFlow Labs' THEN '45678901000104'
  WHEN name = 'Cognitive Systems' THEN '56789012000105'
  WHEN name = 'Neural Innovations' THEN '67890123000106'
  ELSE gen_random_uuid()::text -- Generate a unique string for any other rows
END;

-- Now add the constraints
ALTER TABLE agencies
ALTER COLUMN cnpj SET NOT NULL,
ADD CONSTRAINT agencies_cnpj_check CHECK (cnpj ~ '^[0-9]{14}$'),
ADD CONSTRAINT agencies_cnpj_key UNIQUE (cnpj);