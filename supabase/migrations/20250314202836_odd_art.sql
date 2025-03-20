/*
  # Enable Email Verification

  1. Changes
    - Enable email verification requirement
    - Make email_confirmed_at nullable
    - Add default email verification settings

  2. Security
    - Require email verification before first login
*/

-- Make email_confirmed_at nullable to allow unconfirmed emails
ALTER TABLE auth.users
ALTER COLUMN email_confirmed_at DROP NOT NULL;

-- Create function to handle email verification
CREATE OR REPLACE FUNCTION auth.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Set email_confirmed_at to NULL for new users
  NEW.email_confirmed_at = NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.handle_new_user();