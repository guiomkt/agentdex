/*
  # Add cover_url field to agents table

  1. Changes
    - Add cover_url column to agents table
    - Make it nullable since it's optional
    - Update storage policies to allow cover image uploads

  2. Security
    - Maintain existing RLS policies
*/

-- Add cover_url column to agents table
ALTER TABLE agents
ADD COLUMN cover_url text;

-- Update storage policies to allow cover image uploads
CREATE POLICY "Allow agent cover image uploads"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'public' AND
  (SPLIT_PART(name, '/', 1) = 'agent-covers' AND
   SPLIT_PART(name, '/', 2) = auth.uid()::text)
);

-- Allow users to update their own cover images
CREATE POLICY "Users can update own agent cover images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'public' AND
  owner = auth.uid() AND
  (SPLIT_PART(name, '/', 1) = 'agent-covers' AND
   SPLIT_PART(name, '/', 2) = auth.uid()::text)
);

-- Allow users to delete their own cover images
CREATE POLICY "Users can delete own agent cover images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'public' AND
  owner = auth.uid() AND
  (SPLIT_PART(name, '/', 1) = 'agent-covers' AND
   SPLIT_PART(name, '/', 2) = auth.uid()::text)
);