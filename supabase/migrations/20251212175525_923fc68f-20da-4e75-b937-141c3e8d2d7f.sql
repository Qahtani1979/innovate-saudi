-- =====================================================
-- CREATE FEATURE-SPECIFIC STORAGE BUCKETS
-- =====================================================

-- Challenges bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('challenges', 'challenges', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Solutions bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('solutions', 'solutions', true, 26214400, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Pilots bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pilots', 'pilots', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- Programs bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('programs', 'programs', true, 26214400, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4'])
ON CONFLICT (id) DO NOTHING;

-- R&D Projects bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('rd-projects', 'rd-projects', true, 104857600, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/zip', 'application/x-rar-compressed'])
ON CONFLICT (id) DO NOTHING;

-- Organizations bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('organizations', 'organizations', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Knowledge base bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('knowledge', 'knowledge', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

-- Events bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('events', 'events', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Temp bucket (private, for staging uploads)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('temp', 'temp', false, 26214400)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES FOR NEW BUCKETS
-- =====================================================

-- CHALLENGES BUCKET
CREATE POLICY "Public read access for challenges" ON storage.objects 
FOR SELECT USING (bucket_id = 'challenges');

CREATE POLICY "Authenticated upload to challenges" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'challenges' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner can update challenges files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'challenges' AND auth.uid()::text = owner_id::text);

CREATE POLICY "Owner can delete challenges files" ON storage.objects 
FOR DELETE USING (bucket_id = 'challenges' AND auth.uid()::text = owner_id::text);

-- SOLUTIONS BUCKET
CREATE POLICY "Public read access for solutions" ON storage.objects 
FOR SELECT USING (bucket_id = 'solutions');

CREATE POLICY "Authenticated upload to solutions" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'solutions' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner can update solutions files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'solutions' AND auth.uid()::text = owner_id::text);

CREATE POLICY "Owner can delete solutions files" ON storage.objects 
FOR DELETE USING (bucket_id = 'solutions' AND auth.uid()::text = owner_id::text);

-- PILOTS BUCKET
CREATE POLICY "Public read access for pilots" ON storage.objects 
FOR SELECT USING (bucket_id = 'pilots');

CREATE POLICY "Authenticated upload to pilots" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'pilots' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner can update pilots files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'pilots' AND auth.uid()::text = owner_id::text);

CREATE POLICY "Owner can delete pilots files" ON storage.objects 
FOR DELETE USING (bucket_id = 'pilots' AND auth.uid()::text = owner_id::text);

-- PROGRAMS BUCKET
CREATE POLICY "Public read access for programs" ON storage.objects 
FOR SELECT USING (bucket_id = 'programs');

CREATE POLICY "Authenticated upload to programs" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'programs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner can update programs files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'programs' AND auth.uid()::text = owner_id::text);

CREATE POLICY "Owner can delete programs files" ON storage.objects 
FOR DELETE USING (bucket_id = 'programs' AND auth.uid()::text = owner_id::text);

-- RD-PROJECTS BUCKET
CREATE POLICY "Public read access for rd-projects" ON storage.objects 
FOR SELECT USING (bucket_id = 'rd-projects');

CREATE POLICY "Authenticated upload to rd-projects" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'rd-projects' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner can update rd-projects files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'rd-projects' AND auth.uid()::text = owner_id::text);

CREATE POLICY "Owner can delete rd-projects files" ON storage.objects 
FOR DELETE USING (bucket_id = 'rd-projects' AND auth.uid()::text = owner_id::text);

-- ORGANIZATIONS BUCKET
CREATE POLICY "Public read access for organizations" ON storage.objects 
FOR SELECT USING (bucket_id = 'organizations');

CREATE POLICY "Authenticated upload to organizations" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'organizations' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner can update organizations files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'organizations' AND auth.uid()::text = owner_id::text);

CREATE POLICY "Owner can delete organizations files" ON storage.objects 
FOR DELETE USING (bucket_id = 'organizations' AND auth.uid()::text = owner_id::text);

-- KNOWLEDGE BUCKET
CREATE POLICY "Public read access for knowledge" ON storage.objects 
FOR SELECT USING (bucket_id = 'knowledge');

CREATE POLICY "Authenticated upload to knowledge" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'knowledge' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner can update knowledge files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'knowledge' AND auth.uid()::text = owner_id::text);

CREATE POLICY "Owner can delete knowledge files" ON storage.objects 
FOR DELETE USING (bucket_id = 'knowledge' AND auth.uid()::text = owner_id::text);

-- EVENTS BUCKET
CREATE POLICY "Public read access for events" ON storage.objects 
FOR SELECT USING (bucket_id = 'events');

CREATE POLICY "Authenticated upload to events" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'events' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner can update events files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'events' AND auth.uid()::text = owner_id::text);

CREATE POLICY "Owner can delete events files" ON storage.objects 
FOR DELETE USING (bucket_id = 'events' AND auth.uid()::text = owner_id::text);

-- TEMP BUCKET (private, authenticated only)
CREATE POLICY "Authenticated read own temp files" ON storage.objects 
FOR SELECT USING (bucket_id = 'temp' AND auth.uid()::text = owner_id::text);

CREATE POLICY "Authenticated upload to temp" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'temp' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner can delete temp files" ON storage.objects 
FOR DELETE USING (bucket_id = 'temp' AND auth.uid()::text = owner_id::text);