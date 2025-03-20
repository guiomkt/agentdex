/*
  # Configure storage bucket for file uploads

  1. Changes
    - Create public bucket for storing agent and agency images
    - Set up RLS policies for file access control
    - Enable public access for viewing files

  2. Security
    - Only authenticated users can upload files to their own directories
    - Users can only modify their own files
    - Anyone can view public files
*/

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public access to view files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'public' AND
  (
    -- Allow uploads to agent-images/user_id/
    (SPLIT_PART(name, '/', 1) = 'agent-images' AND
     SPLIT_PART(name, '/', 2) = auth.uid()::text)
    OR
    -- Allow uploads to agency-logos/user_id/
    (SPLIT_PART(name, '/', 1) = 'agency-logos' AND
     SPLIT_PART(name, '/', 2) = auth.uid()::text)
  )
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'public' AND
  owner = auth.uid() AND
  (
    -- Allow updates to agent-images/user_id/
    (SPLIT_PART(name, '/', 1) = 'agent-images' AND
     SPLIT_PART(name, '/', 2) = auth.uid()::text)
    OR
    -- Allow updates to agency-logos/user_id/
    (SPLIT_PART(name, '/', 1) = 'agency-logos' AND
     SPLIT_PART(name, '/', 2) = auth.uid()::text)
  )
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'public' AND
  owner = auth.uid() AND
  (
    -- Allow deletes from agent-images/user_id/
    (SPLIT_PART(name, '/', 1) = 'agent-images' AND
     SPLIT_PART(name, '/', 2) = auth.uid()::text)
    OR
    -- Allow deletes from agency-logos/user_id/
    (SPLIT_PART(name, '/', 1) = 'agency-logos' AND
     SPLIT_PART(name, '/', 2) = auth.uid()::text)
  )
);