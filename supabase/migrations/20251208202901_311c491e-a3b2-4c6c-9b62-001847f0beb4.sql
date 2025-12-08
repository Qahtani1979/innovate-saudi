-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads', 
  'uploads', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Allow public read access to uploads
CREATE POLICY "Public read access for uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'uploads');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'uploads');