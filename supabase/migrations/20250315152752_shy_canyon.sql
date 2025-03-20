/*
  # Fix storage policies for file uploads

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create new, simplified policies for agent and agency images
    - Enable public access for viewing files
    - Allow authenticated users to upload files

  2. Security
    - Only authenticated users can upload files
    - Users can only modify their own files
    - Anyone can view public files
*/

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow cover image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own cover images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own cover images" ON storage.objects;
DROP POLICY IF EXISTS "Allow agent cover image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own agent cover images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own agent cover images" ON storage.objects;

-- Allow public access to view files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'public');

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'public' AND owner = auth.uid());

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'public' AND owner = auth.uid());