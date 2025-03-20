/*
  # Add price field to agents table

  1. Changes
    - Add starting_price column to agents table
    - Make it nullable since some agents might be free
    - Add check constraint to ensure price is positive when present

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE agents
ADD COLUMN starting_price numeric CHECK (starting_price IS NULL OR starting_price >= 0);

-- Update existing agents with sample prices
UPDATE agents SET starting_price = 
  CASE 
    WHEN price_type = 'free' THEN NULL
    WHEN price_type = 'paid' THEN 
      CASE 
        WHEN name = 'Oraczen''s Zen Platform' THEN 299.90
        WHEN name = 'Vessium' THEN 199.90
        ELSE 99.90
      END
    WHEN price_type = 'freemium' THEN 
      CASE 
        WHEN name = 'Beam AI' THEN 49.90
        ELSE 29.90
      END
  END;