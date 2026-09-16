-- Create bucket for company logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('logos', 'logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'])
ON CONFLICT (id) DO NOTHING;

-- RLS: public read
CREATE POLICY "logos_select_public" ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

-- RLS: authenticated upload
CREATE POLICY "logos_insert_auth" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- RLS: authenticated update/delete
CREATE POLICY "logos_update_auth" ON storage.objects FOR UPDATE
  USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

CREATE POLICY "logos_delete_auth" ON storage.objects FOR DELETE
  USING (bucket_id = 'logos' AND auth.role() = 'authenticated');
