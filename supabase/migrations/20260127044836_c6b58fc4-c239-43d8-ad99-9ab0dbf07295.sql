-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can insert locations" ON public.locations;

-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('found-items', 'found-items', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for found-items bucket
CREATE POLICY "Anyone can view found item images"
ON storage.objects FOR SELECT
USING (bucket_id = 'found-items');

CREATE POLICY "Authenticated users can upload found item images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'found-items');

CREATE POLICY "Users can update their own uploaded images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'found-items' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploaded images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'found-items' AND auth.uid()::text = (storage.foldername(name))[1]);
